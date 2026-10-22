import { expect, test, type Page, type Locator } from "@playwright/test";

async function drag(page: Page, handle: Locator, dx: number, dy: number) {
  const rect = (await handle.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2 + dx,
    rect.y + rect.height / 2 + dy,
    { steps: 8 },
  );
  await page.mouse.up();
}

async function createdNote(page: Page): Promise<Locator> {
  const editor = page.locator("textarea:focus");
  await expect(editor).toBeFocused();
  const id = await editor.evaluate((element) =>
    element.closest("article")?.getAttribute("data-note-id"),
  );
  return page.locator(`[data-note-id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "All changes saved", exact: true }),
  ).toBeVisible();
});

test("draw, edit, move, resize, recolor, trash, undo and restore", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("button", { name: "New note color: sky", exact: true })
    .click();
  await page
    .getByRole("button", { name: "New note", exact: false })
    .filter({ hasText: "New note" })
    .click();
  const board = page.getByRole("region", {
    name: "Draw a note here, or press Enter to create one in the center",
    exact: true,
  });
  const rect = (await board.boundingBox())!;
  await page.mouse.move(rect.x + 40, rect.y + 370);
  await page.mouse.down();
  await page.mouse.move(rect.x + 350, rect.y + 550, { steps: 8 });
  await page.mouse.up();
  const note = await createdNote(page);
  await expect(note).toHaveAttribute("data-color", "sky");
  await expect(note).toHaveCSS("width", "310px");
  await note
    .locator("textarea")
    .fill("A carefully tested idea.\nKeep this line.");
  const before = (await note.boundingBox())!;
  await drag(page, note.getByTestId("move-handle"), 55, -90);
  const moved = (await note.boundingBox())!;
  expect(moved.x).toBeCloseTo(before.x + 55, 0);
  expect(moved.y).toBeCloseTo(before.y - 90, 0);
  await drag(page, note.getByTestId("resize-handle"), 45, 30);
  await expect(note).toHaveCSS("width", "355px");
  await note.getByRole("button", { name: /Change color/ }).click();
  await note.getByRole("button", { name: "lavender", exact: true }).click();
  await expect(note).toHaveAttribute("data-color", "lavender");
  const savedBox = await note.boundingBox();
  await expect(
    page.getByRole("button", { name: "All changes saved", exact: true }),
  ).toBeVisible();
  await page.reload();
  const restored = page.locator("article").filter({
    has: page.locator("textarea", { hasText: "A carefully tested idea." }),
  });
  await expect(restored).toHaveCount(1);
  await expect(restored).toHaveAttribute("data-color", "lavender");
  await expect(restored).toHaveCSS("z-index", "4");
  await expect(restored.locator("textarea")).toHaveValue(
    "A carefully tested idea.\nKeep this line.",
  );
  expect(await restored.boundingBox()).toEqual(savedBox);
  const trash = (await page
    .getByLabel("Trash zone. Release the move pointer here to delete.")
    .boundingBox())!;
  const handle = (await restored.getByTestId("move-handle").boundingBox())!;
  await page.mouse.move(handle.x + 20, handle.y + 15);
  await page.mouse.down();
  await page.mouse.move(trash.x + trash.width / 2, trash.y + trash.height / 2, {
    steps: 10,
  });
  await expect(
    page.getByText("Release to delete", { exact: true }),
  ).toBeVisible();
  await page.mouse.up();
  await expect(page.locator("article")).toHaveCount(3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(4);
  await expect(restored.locator("textarea")).toHaveValue(
    "A carefully tested idea.\nKeep this line.",
  );
  expect(errors).toEqual([]);
});

test("keyboard controls and Escape cancellation at the minimum resolution", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page
    .getByRole("button", { name: "New note", exact: false })
    .filter({ hasText: "New note" })
    .click();
  await page.keyboard.press("Enter");
  const note = await createdNote(page);
  await expect(note.locator("textarea")).toBeFocused();
  await note.locator("textarea").fill("Keyboard note");
  const handle = note.getByTestId("move-handle");
  await handle.focus();
  await expect(handle).toBeFocused();
  const initial = (await note.boundingBox())!;
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await note.boundingBox())?.x)
    .toBe(initial.x + 5);
  await page.keyboard.press("Shift+ArrowDown");
  await expect
    .poll(async () => (await note.boundingBox())?.y)
    .toBe(initial.y + 20);
  const moved = (await note.boundingBox())!;
  expect(moved.x).toBe(initial.x + 5);
  expect(moved.y).toBe(initial.y + 20);
  await note.getByTestId("resize-handle").focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect(note).toHaveCSS("width", `${initial.width + 20}px`);
  expect((await note.boundingBox())!.width).toBe(initial.width + 20);
  const start = (await handle.boundingBox())!;
  await page.mouse.move(start.x + 10, start.y + 10);
  await page.mouse.down();
  await page.mouse.move(start.x + 110, start.y + 30, { steps: 6 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await note.boundingBox())!.x).toBe(moved.x);
  await handle.focus();
  await page.keyboard.press("Delete");
  await expect(page.locator("article")).toHaveCount(3);
  await page.keyboard.press("Control+z");
  await expect(page.locator("article")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByLabel("Trash zone. Release the move pointer here to delete."),
  ).toBeInViewport({ ratio: 1 });
});

test("simulates API failure, keeps local edits, and retries successfully", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "All changes saved", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Fail the next API request", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const text = page.locator("textarea").last();
  await text.fill("Still safe after a network error");
  await expect(
    page.getByRole("button", { name: "Sync needs attention", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sync needs attention", exact: true })
    .click();
  await expect(
    page.getByText(
      "Sync failed (503). Your current notes remain on the board.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry sync", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "All changes saved", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.reload();
  await expect(page.locator("textarea").last()).toHaveValue(
    "Still safe after a network error",
  );
});

test("keeps an empty board empty after reload", async ({ page }) => {
  for (let i = 0; i < 3; i++)
    await page
      .locator("article")
      .last()
      .getByRole("button", { name: /Delete note/ })
      .click();
  await expect(page.getByText("A fresh start.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("A fresh start.", { exact: true })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
});

test("flushes a pending local text save on immediate reload", async ({
  page,
}) => {
  const note = page.locator('[data-note-id="welcome"]');
  await note.locator("textarea").fill("Saved before the debounce finishes");
  await page.reload();
  await expect(note.locator("textarea")).toHaveValue(
    "Saved before the debounce finishes",
  );
});

test("brings an earlier note forward without interrupting editing or color-picker focus", async ({
  page,
}) => {
  const note = page
    .locator("article")
    .filter({ has: page.locator('[data-note-handle="welcome"]') });
  await note.locator("textarea").click();
  await expect(note).toHaveCSS("z-index", "3");
  await expect(note.locator("textarea")).toBeFocused();
  await note.locator("textarea").fill("Editing a previously covered note");
  await page.keyboard.type(" works");
  await expect(note.locator("textarea")).toHaveValue(
    "Editing a previously covered note works",
  );
  const colorButton = note.getByRole("button", { name: /Change color/ });
  await colorButton.click();
  await expect(
    note.getByRole("button", { name: "butter", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(colorButton).toBeFocused();
  await expect(
    page.getByRole("button", { name: "All changes saved", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(note).toHaveCSS("z-index", "3");
  await expect(note.locator("textarea")).toHaveValue(
    "Editing a previously covered note works",
  );
});

test("fits notes after shrinking the window and keeps controls fully visible", async ({
  page,
}) => {
  const note = page.locator("article").last();
  await drag(page, note.getByTestId("move-handle"), 900, 600);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(
    page.getByRole("button", { name: "All changes saved", exact: true }),
  ).toBeVisible();
  const board = (await page.getByTestId("board").boundingBox())!;
  for (const item of await page.locator("article").all()) {
    const box = (await item.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(board.x);
    expect(box.y).toBeGreaterThanOrEqual(board.y);
    expect(box.x + box.width).toBeLessThanOrEqual(board.x + board.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(board.y + board.height + 1);
  }
  await expect(
    page
      .getByRole("button", { name: "New note", exact: false })
      .filter({ hasText: "New note" }),
  ).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByLabel("Trash zone. Release the move pointer here to delete."),
  ).toBeInViewport({ ratio: 1 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
});

test("draws backwards and cancels an interrupted pointer gesture", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "New note", exact: false })
    .filter({ hasText: "New note" })
    .click();
  const board = (await page.getByTestId("board").boundingBox())!;
  await page.mouse.move(board.x + 700, board.y + 400);
  await page.mouse.down();
  await page.mouse.move(board.x + 500, board.y + 200, { steps: 6 });
  await page.mouse.up();
  const note = await createdNote(page);
  await expect(note).toHaveCSS("width", "200px");
  await expect(note).toHaveCSS("height", "200px");
  const before = await note.boundingBox();
  const handle = (await note.getByTestId("move-handle").boundingBox())!;
  await page.mouse.move(handle.x + 10, handle.y + 10);
  await page.mouse.down();
  await page.mouse.move(handle.x + 90, handle.y + 80, { steps: 5 });
  await page.getByTestId("board").dispatchEvent("pointercancel");
  await page.mouse.up();
  expect(await note.boundingBox()).toEqual(before);
});
