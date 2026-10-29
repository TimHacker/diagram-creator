# Diagram Creator

A browser-based workspace for developer diagrams. Create shapes, attach connectors, edit labels and colours, and export the complete diagram as a PNG.

## Run Locally

Use Node.js 24 LTS (minimum 22.12) and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The initial service architecture is fully editable; **New diagram** starts a blank canvas.

## Editing and Saving

- Add rectangles, ellipses and diamonds from the library.
- Move shapes by dragging; resize with corner handles or geometry fields.
- Edit a selected shape or connector in Properties.
- Connect shapes by dragging between connection handles, or choosing **Connect to** in Properties.
- Undo/redo from the toolbar or with Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z. Delete/Backspace deletes the selection.
- **Save** (Cmd/Ctrl+S outside an input) stores one editable diagram in this browser, for this site origin. Save again to replace it.
- **Export PNG** downloads the entire diagram, including off-screen shapes, without editor controls.

Saving is explicit, not automatic. Browser storage is not a backup: clearing site data removes the saved diagram. The development and preview ports have separate storage. Image sharing does not preserve editability or provide live collaboration.

Editing, saving and PNG export work without network access after the app has loaded. Offline startup is not supported. Fonts are bundled locally, including an embedded font for image export.

## Acceptance Tests

```sh
npx playwright install chromium
npm test
npm run build
npm run format:check
```

The Playwright suite exercises the ten user-approved Given/When/Then scenarios, plus mobile layout and pointer-resize persistence. Each test uses isolated browser storage. Tests start their own Vite server on port 4173. CI repeats formatting, build and Chromium checks and uploads test evidence.

Delivery uses ATDD: agree observable scenarios, write and run failing acceptance tests, implement, then verify. [The show-and-tell log](docs/show-and-tell.md) records decisions, red/green evidence, findings and limitations.

## Delivery Tracking

- [Private repository](https://github.com/TimHacker/diagram-creator)
- [GitHub Project](https://github.com/users/TimHacker/projects/3)
- [First release and acceptance criteria](https://github.com/TimHacker/diagram-creator/issues/1)
- [Icon packs backlog](https://github.com/TimHacker/diagram-creator/issues/2)
- [Architecture tools backlog](https://github.com/TimHacker/diagram-creator/issues/3)

## Implementation

React, TypeScript and Vite, with React Flow's MIT-licensed core for canvas interactions, html-to-image for PNG export, Lucide icons and locally bundled DM Sans and Space Grotesk fonts. No backend, cloud resources, authentication, tracking or paid React Flow components.

Very large PNG exports are rejected to limit browser memory use. Browser verification currently targets Chromium; Safari and Firefox remain unverified. Chromium may emit transient ResizeObserver notifications while dragging resize handles; resize, save and reload are covered by regression tests.
