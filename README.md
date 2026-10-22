# Little Notes

A small, desktop-first thinking space built with React, strict TypeScript, and Tailwind CSS 4. The whiteboard fills the window, with compact floating controls and dedicated space for notes between the controls. All four core features and all five bonus features are implemented. Components, drag interactions, and state management are implemented directly, without ready-made component or drag-and-drop libraries.

## Run locally

Use Node.js **22.12 or newer** and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

```sh
npm run build       # Strict TypeScript check + production build in dist/
npm run preview     # Serve the production build locally
npm test            # Deterministic unit and synchronization tests
npm run test:e2e    # Chrome, Edge, and Firefox browser tests
npm run lint        # Type-aware TypeScript, React Hooks, and component checks
npm run format:check # Formatting and Tailwind class ordering
npm run check       # Lint + format + build + unit tests
```

For browser tests, install Chrome and Edge and run `npx playwright install firefox`. Each test uses an isolated browser context. The suite builds the production app and starts a separate preview server on port 5182, avoiding development reloads during tests. `npx playwright test --project=chrome` runs one browser. Build output is static and can be served from any static host; `base: './'` also supports subdirectory hosting.

## Use the board

- **Create:** select a color, click **New note**, then draw a rectangle anywhere on the board. Drawing in any direction works. Click without dragging for a 270 × 250 px note. Press Enter while in creation mode to place a note centrally.
- **Write:** click a note's text. Plain text, line breaks, browser spellcheck, and native text selection work normally. Long text scrolls inside the note; text is limited to 10,000 characters per note.
- **Move:** drag the note's top handle. The original grab point is retained, and the note stays inside the board.
- **Resize:** drag the bottom-right corner. The minimum size is 180 × 160 px; the maximum is the available board area.
- **Layer:** interacting with a note brings it to the front. Stacking order is saved.
- **Recolor:** click the small circle in a note's header to choose from five colors.
- **Delete:** drag the move handle until the **pointer** enters the trash zone and release. The target changes appearance before deletion. The header's delete button is an alternative. **Undo** restores the most recently deleted note, including its content and stacking position.
- **Cancel:** Escape cancels creation, movement, or resizing. Pointer cancellation also discards unfinished geometry.
- **Save:** notes save locally as you edit. Click the saving indicator for API status, retry, conflict resolution, a JSON backup, and demo controls.

### Keyboard

- `N`: create and focus a default-size note, outside text fields and dialogs.
- `Tab` / `Shift+Tab`: navigate all interactive controls.
- Arrow keys on a **move handle**: move by 5 px; hold Shift for 20 px.
- Arrow keys on a **resize handle**: resize by 5 px; hold Shift for 20 px.
- `Delete` / `Backspace` on either handle: remove that note.
- `Ctrl+Z` / `Cmd+Z` outside text fields: restore the last deleted note. Inside text fields, native text undo is preserved.
- `Escape`: cancel a gesture or close a dialog; native modal focus management returns focus to the opener.

## Architecture

The application separates UI composition, interaction hooks, domain rules, and persistence. `App.tsx` composes small components, with one React component per file. `domain/` contains note types, shared limits, runtime validation, pure board transitions, and geometry functions used by both pointer and keyboard interactions. The ordered note array defines stacking order; stable DOM order preserves editor focus while CSS stacking changes. Focus management, creation/deletion, viewport fitting, pointer gestures, and keyboard shortcuts have separate hooks. Pointer capture and animation-frame previews keep dragging independent of persistence; geometry is committed only when a gesture finishes. Tailwind CSS 4 supplies component styling, with a small stylesheet for its theme, bundled fonts, and global defaults. Inline styles are limited to runtime note geometry and stacking.

`NotesStore` owns document transitions and synchronization, exposing stable snapshots through React's `useSyncExternalStore`. A validated local snapshot restores immediately. `SnapshotWriter` batches serialization and local storage writes after 150 ms of inactivity, with a 1-second maximum wait during continuous typing; page hiding, page exit, and store teardown flush pending work. This avoids serializing the entire board for each keystroke. A separate 500 ms remote debounce, one in-flight save, and a generation counter retain edits made during a request. Startup loading cannot silently replace new edits, dirty state and revisions survive reloads, and conflicts require an explicit choice. Invalid original storage is preserved until the user enables replacement. Domain transitions enforce note capacity, uniqueness, text limits, and no-op detection rather than relying solely on UI checks.

`createBoardApi` is a typed REST client for `GET /api/notes` and `PUT /api/notes`, with an injected transport and shared response validation. The separate `MockService` returns native `Response` objects after a configurable delay, supports cancellation and simulated 503 failures, and checks optimistic revisions with 409 responses. Its controls are instance-scoped and subscribed to by the settings UI, without a mutable global settings object. A separate browser-storage record stands in for its database. Connecting a real backend requires replacing the mock transport with `request => fetch(request)` while preserving the contract below. Runtime JavaScript dependencies remain React and React DOM; Tailwind, Vite, Vitest, Playwright, ESLint, and Prettier are development tools. GitHub Actions runs the checks and browser suite on push and pull requests.

## Mock REST contract

```text
GET /api/notes
  200 { version: 1, revision: number, notes: Note[] }
  404 when no remote board exists

PUT /api/notes
  Content-Type: application/json
  Body: { version: 1, revision: number, notes: Note[] }
  200 { version: 1, revision: previousRevision + 1, notes: Note[] }
  400 invalid payload
  409 revision mismatch
  503 simulated failure
```

The first save uses revision 0. A real server must atomically compare the supplied revision and write the new board. The mock uses a synchronous read/compare/write after its delay; separate browser tabs can demonstrate a conflict.

**The mock is not cloud storage.** Local and simulated remote records both live in this browser and origin. Clearing site data removes both. The mock produces asynchronous REST-shaped requests and responses in-process, so they do not appear as actual network requests in DevTools. Demo controls are available by clicking the saving indicator. Arm a failure, close the dialog, edit a note, then reopen the indicator to retry. JSON backups contain the current document for inspection and manual recovery; automatic import is outside this submission.

## Design decisions and limits

- Designed for desktop viewports from **1024 × 768**, with no required page scrolling at that size. Smaller screens are outside the brief.
- The board fits the viewport rather than providing an infinite canvas. Shrinking it permanently fits notes into the new bounds so every note remains reachable. Overlap is intentional and supported.
- Native textareas keep editing, selection, spellcheck, IME input, and native text undo reliable. Rich text is outside scope.
- Deletion undo covers the last deleted note for the current session. Filling the final available slot with a new note consumes deletion undo, so restoring cannot exceed capacity. General document history is outside scope.
- Synchronization is whole-document and revision-based. Concurrent tabs require a choice on conflict; there is no collaborative merge or live cross-tab update.
- The two fonts are bundled locally; the app does not request remote fonts. Their SIL Open Font licenses are included in `public/licenses/` and copied into the production build.
- Boards hold up to 1,000 notes. The limit is shared by creation and saved-data validation.
- Local saves have a maximum 1-second batching window during continuous typing and flush on normal page exit. An abrupt browser or operating-system crash can lose the most recent unflushed edits.
- The app provides visible focus states, labeled controls, a live announcement region, reduced-motion support, keyboard geometry controls, and native modal dialogs. This is not a claim of a formal accessibility certification.
- Windows Chrome, Edge, and Playwright Firefox have been exercised locally. The CI workflow is configured to run the same checks on Windows, macOS, and Linux; those remote runs have not been verified in this environment.

## Project map

```text
src/
  App.tsx             Full-window board composition
  components/
    board/            Canvas, floating controls, hints, and undo
    note/             Memoized note card and note header
    dialogs/          Separate help, sync, and demo settings components
    ui/               Shared buttons, color picker, dialog, and icons
  hooks/              Focused interaction and lifecycle hooks
  domain/             Types, constants, validation, board rules, and geometry
  data/               REST client, mock service, local writer, and backup export
  store/              Document state and serialized synchronization
  styles.css          Tailwind 4 import, theme, fonts, and base defaults
  **/*.test.ts        Co-located domain, storage, API, and sync regressions
e2e/board.spec.ts      Real-browser interaction workflows
.github/workflows/ci.yml Automated checks and browser tests
```
