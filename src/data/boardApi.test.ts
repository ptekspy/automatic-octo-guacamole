import { describe, expect, it } from "vitest";
import { createBoardApi } from "./boardApi";

describe("REST response validation", () => {
  it("rejects an invalid note payload", async () => {
    const api = createBoardApi(
      () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              version: 1,
              revision: 1,
              notes: [{ id: "invalid" }],
            }),
          ),
        ),
      "https://notes.test",
    );
    await expect(api.load(new AbortController().signal)).rejects.toThrow(
      "invalid board",
    );
  });
  it("accepts missing remote state without replacing it with a placeholder", async () => {
    const api = createBoardApi(
      () => Promise.resolve(new Response(null, { status: 404 })),
      "https://notes.test",
    );
    await expect(api.load(new AbortController().signal)).resolves.toBeNull();
  });
});
