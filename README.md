# Diagram Creator

A browser-based workspace for developer diagrams. Create shapes, attach connectors, edit labels and colours, and export the complete diagram as a PNG.

## Shared Site

[Open Diagram Creator](https://timhacker.github.io/diagram-creator/).

The site and source repository are public. Each visitor's diagrams stay in their own browser. Sharing the URL shares the editor, not a saved diagram; export a PNG to share a drawing. Diagrams saved on localhost are not automatically transferred to the live site.

## Run Locally

Use Node.js 24 LTS (minimum 22.12) and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The initial service architecture is fully editable; **New diagram** starts a blank canvas.

## Editing and Saving

- Add rectangles, ellipses and diamonds from the library.
- Add icons from two bundled icon packs: **Generic architecture** (Lucide, ISC) and **Cloud & platforms** (Simple Icons, CC0). Search filters both packs. Change or remove a shape's icon in Properties.
- Move shapes by dragging; resize with corner handles or geometry fields.
- Edit a selected shape or connector in Properties.
- Connect shapes by dragging between the handles on any of their four sides, or choosing **Connect to** in Properties. Arrows point from the dragged source to the target.
- Undo/redo from the toolbar or with Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z. Delete/Backspace deletes the selection.
- **Save** (Cmd/Ctrl+S outside an input) stores one editable diagram in this browser, for this site origin. Save again to replace it.
- **Export PNG** downloads the entire diagram, including off-screen shapes, without editor controls.

Saving is explicit, not automatic. Browser storage is not a backup: clearing site data removes the saved diagram. The development and preview ports have separate storage. Image sharing does not preserve editability or provide live collaboration.

Editing, saving, adding icons and PNG export work without network access after the app has loaded. Offline startup is not supported. Fonts and icons are bundled locally, including an embedded font for image export.

## Icon Licences

Icon pack sources, licences, versions and trademark caveats are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Brand logos remain trademarks of their owners. AWS and Azure icons are not included.

## Acceptance Tests

```sh
npx playwright install chromium
npm test
npm run build
npm run format:check
```

The Playwright suite exercises the ten user-approved first-release Given/When/Then scenarios, the eight approved icon-pack scenarios (I1–I8), plus drag-to-connect arrows, mobile layout and pointer-resize persistence. Pointer tests cover all four connection directions, history, persistence, invalid drops and panning. Each test uses isolated browser storage. Tests start their own Vite server on port 4173. CI repeats formatting, build and Chromium checks and uploads test evidence.

CI tests production output at the real Pages project path, including an additional asset and home-link regression check:

```sh
DEPLOY_BASE_PATH=/diagram-creator/ npm run build
DEPLOY_BASE_PATH=/diagram-creator/ PLAYWRIGHT_PRODUCTION=true npm test
```

To run the same suite against the deployed site without starting a local server:

```sh
PLAYWRIGHT_BASE_URL=https://timhacker.github.io/diagram-creator/ PLAYWRIGHT_PRODUCTION=true npm test
```

Delivery uses ATDD: agree observable scenarios, write and run failing acceptance tests, implement, then verify. [The show-and-tell log](docs/show-and-tell.md) records decisions, red/green evidence, findings and limitations.

## Delivery Tracking

- [Public repository](https://github.com/TimHacker/diagram-creator)
- [GitHub Project](https://github.com/users/TimHacker/projects/3)
- [First release and acceptance criteria](https://github.com/TimHacker/diagram-creator/issues/1)
- [Icon packs backlog](https://github.com/TimHacker/diagram-creator/issues/2)
- [Architecture tools backlog](https://github.com/TimHacker/diagram-creator/issues/3)
- [Deployment and live verification](https://github.com/TimHacker/diagram-creator/issues/5)

## Deployment

GitHub Pages hosts the public source repository directly at `/diagram-creator/`. The previous build-output repository is retained as a legacy site; it is no longer the deployment target.

The Actions workflow builds for `/diagram-creator/`, runs production acceptance tests, and uploads the verified Pages artefact. On successful main-branch runs, the deployment job publishes that exact artefact using native Pages permissions and GitHub's short-lived identity token. No cross-repository SSH credential is needed. Pull requests cannot run the deployment job.

No paid resources or account upgrades were provisioned. Hosting uses public-repository Pages. Public JavaScript bundles are downloadable, as with any client-side application.

## Implementation

React, TypeScript and Vite, with React Flow's MIT-licensed core for canvas interactions, html-to-image for PNG export, Lucide and Simple Icons icon packs, and locally bundled DM Sans and Space Grotesk fonts. No backend, cloud resources, authentication, tracking or paid React Flow components.

Very large PNG exports are rejected to limit browser memory use. Browser verification currently targets Chromium; Safari and Firefox remain unverified. Chromium may emit transient ResizeObserver notifications while dragging resize handles; resize, save and reload are covered by regression tests.
