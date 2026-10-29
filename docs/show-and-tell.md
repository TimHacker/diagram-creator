# Diagram Creator: Decisions and Learnings

## 2026-10-29: Scope and Setup

### Agreed Decisions

- Build a browser-only diagram editor for developer diagrams.
- First release: editable shapes, labels, connectors, undo/redo, local saving and PNG export.
- Team sharing initially means downloading an image to send to colleagues.
- Defer icon packs and additional architecture tools to the backlog.
- Exclude live collaboration, accounts and cloud storage from the first release.
- Create a private `diagram-creator` repository under the signed-in personal GitHub account.
- Manage delivery through GitHub issues and a GitHub Project.
- Use acceptance test-driven development (ATDD): agree Given/When/Then scenarios before implementation, demonstrate failing tests, implement, then rerun the tests.
- Keep this log updated for the show and tell. Distinguish agreed decisions, proposals and verified evidence.

### Implementation Choices

- React, TypeScript and Vite, using React Flow's MIT-licensed core for diagram interactions. The installed React Flow 12.12.0 licence was inspected and confirmed as MIT; no Pro features used.
- Initial shapes: rectangle, ellipse and diamond. Shape set and acceptance scenarios explicitly approved before implementation.
- Playwright for browser acceptance tests, with isolated storage per test.
- Local saving in browser storage, tied to the browser and site origin. Clearing browser data removes saved diagrams.
- html-to-image exports the diagram viewport, using all shape bounds rather than the visible screen. An embedded local font avoids network fetches during offline export.
- The first screen contains an editable service architecture, not a landing page.
- GitHub Actions repeats formatting, production build and Chromium acceptance checks.
- User explicitly authorised the initial Git commit and push after reviewing the working preview status.

### Approved Acceptance Scenarios

| Given                                        | When                     | Then                                                                        |
| -------------------------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| An empty diagram                             | Add each supported shape | Each appears and can be selected independently.                             |
| A selected shape                             | Move or resize it        | Only its position or dimensions change.                                     |
| A shape or connector                         | Edit its label           | The new label appears.                                                      |
| Two connected shapes                         | Move either shape        | The connector remains attached to both.                                     |
| A connected shape                            | Delete it                | The shape and its attached connectors disappear.                            |
| A completed edit                             | Undo, then redo          | The previous state returns, then the edit is restored.                      |
| An undone edit                               | Make a different edit    | The abandoned edit cannot be redone.                                        |
| A diagram with shapes, labels and connectors | Save locally and reload  | Contents, geometry and connections are restored.                            |
| A diagram larger than the visible canvas     | Export PNG               | The whole diagram is included, with readable labels and no editor controls. |
| The app has loaded                           | Disable network access   | Editing, local saving and PNG export still work.                            |

### Verified Findings

- The workspace was empty at the start.
- GitHub CLI is authenticated as `TimHacker`.
- Granted GitHub scopes include `repo`, `project` and `workflow`; creation operations have not yet been attempted.
- Local tooling: Node.js `v25.3.0`, npm `11.6.2`.

### Learnings and Trade-offs

- Image sharing and editable-diagram sharing are different requirements. PNG export covers the former, not the latter.
- Browser-only storage avoids a backend for the first release, but does not provide team access or a durable backup.
- ATDD needs observable behaviour and agreed scenarios before app code; a test-first claim should be backed by recorded failing and passing runs.
- Authentication and scopes are prerequisites, not proof that repository or Project creation will succeed.

### Delivery Evidence

- [Private repository](https://github.com/TimHacker/diagram-creator) and [private Project](https://github.com/users/TimHacker/projects/3) created under `TimHacker`.
- [Issue 1](https://github.com/TimHacker/diagram-creator/issues/1): approved first release and acceptance criteria, moved to In Progress during implementation.
- [Issue 2](https://github.com/TimHacker/diagram-creator/issues/2): architecture icon packs backlog.
- [Issue 3](https://github.com/TimHacker/diagram-creator/issues/3): additional architecture tools backlog.
- Red baseline: `npm test -- --grep 'A1:' --timeout 4000` exited 1 against a blank entry point, waiting for the missing New diagram control.
- Full red baseline: `npm test -- --timeout 4000 --workers 4` exited 1; all ten scenarios failed at that same missing setup control. This establishes missing functionality, not ten independent assertion failures.
- First green slice: A1 passed after implementation (1 passed, exit 0).
- First full run: 8 passed, 2 failed (exit 1). Both failures were test-targeting errors: a live last-element locator changed identity after insertion; a horizontal SVG path had no clickable bounding-box height. Replaced with a stable shape locator and React Flow's keyboard connector selection, without weakening behaviour assertions.
- Corrected A2/A3 checks: 2 passed (exit 0). Production build also passed (exit 0).
- Additional regression checks first failed (2 failed, exit 1): mobile hid New diagram and overlaid the canvas; pointer-resized shapes reverted to old dimensions after save/reload.
- Fixed pointer resize by synchronising diagram style dimensions with React Flow resize changes, preserving them in saved snapshots.
- Fixed mobile by docking Properties below the canvas and retaining icon-only document commands. Browser measurements at 390 x 844 confirmed no panel/canvas overlap and no horizontal overflow.
- Focused regression verification: mobile, pointer resize and strengthened PNG checks all passed (3 passed, exit 0).
- PNG pixel checks verify content at both ends of a diagram wider than the viewport and a clear outer margin, rather than only checking the download filename.
- Desktop screenshot inspected at 1440 x 900; mobile verification uses 390 x 844.
- Final full local suite: `npm test -- --workers 4` passed all 12 tests (exit 0). `npm run build` and `npm run format:check` both passed (exit 0).
- Final contrast and CSS override corrections were followed by connector-label, PNG pixel, mobile and pointer-resize checks: 4 passed (exit 0), with build and formatting also passing.
- [Runtime verification report](runtime-validation-report.md) summarises the verification environment and coverage.
- Initial implementation published in commit `c6e45db`. [GitHub Actions run 40889739085](https://github.com/TimHacker/diagram-creator/actions/runs/40889739085) completed successfully: clean install, formatting, production build, Chromium acceptance suite and evidence upload all passed.
- Final local preview: `http://127.0.0.1:5174/`. Port 5173 was occupied, so the final preview uses a separate port.

### Remaining Limitations

- One explicitly saved diagram per browser and origin; no file-based editable interchange, cloud backup or live collaboration yet.
- Offline editing is supported after loading, not offline startup.
- Automated browser coverage is Chromium only; Firefox and Safari have not been verified.
- Very large image exports are rejected to bound browser memory consumption.
- Chromium logs transient ResizeObserver notifications during pointer resize. Geometry, save/reload and rendering behaviour are regression-tested; warnings have not been suppressed or claimed fixed. Tracked in [issue 4](https://github.com/TimHacker/diagram-creator/issues/4).
- The site is now publicly hosted; sharing the editor URL does not share browser-local saved diagrams.

## Show-and-Tell Sequence

1. Open the Project: first release versus explicitly deferred icon packs and tools.
2. Show the ten approved scenarios and the initial failing test evidence.
3. Edit the service architecture: labels, colours, attached connectors, resize and undo/redo.
4. Save, reload and verify the diagram is still editable.
5. Move a shape off-screen and export: the PNG still includes the whole diagram.
6. Show mobile Properties below the canvas, then the regression tests that drove the fix.
7. End with the final test/build results, limitations and backlog rather than claiming unsupported collaboration or cloud persistence.

## 2026-10-29: Shareable Deployment

### Decisions

- Deployment requested in this conversation. With the user unavailable for further questions, use a public static URL, retain private source and avoid paid resources or account upgrades.
- Direct Pages creation for the private repository failed with HTTP 422: the current account plan does not support Pages for that repository.
- Use [a separate public build-output repository](https://github.com/TimHacker/diagram-creator-site), not a public source repository. Only browser-delivered HTML, JavaScript, CSS and fonts are published, with no source maps, tests or private documentation.
- Site URL: `https://timhacker.github.io/diagram-creator-site/`. HTTPS is enforced by Pages.
- Build and browser-test the actual production output under `/diagram-creator-site/`, rather than treating a passing root-path development server as deployment evidence.
- CI publishes the exact verified artefact only after acceptance tests pass, using an SSH deploy key restricted to the public site repository. The private key was passed directly to Actions secrets and never printed or recorded.
- Share the app URL to give colleagues their own editor; share exported PNGs to show a particular drawing. Localhost diagrams are not automatically migrated to the hosted origin.

### ATDD and Findings

- [Deployment issue 5](https://github.com/TimHacker/diagram-creator/issues/5) records acceptance criteria and is tracked in the Project.
- New deployment test first failed (1 failed, exit 1): generated asset paths began at `/assets/` rather than the project path.
- Fixed Vite's production base path and the home link. The same test then passed (1 passed, exit 0).
- Updated browser tests to resolve `./` against the supplied site URL, allowing identical tests to exercise local production previews and the hosted project path.
- Full production-preview gate: 13 passed, 0 failed (exit 0), plus passing build and formatting.
- Pre-publication assertion caught a missing `.nojekyll` marker; no files were uploaded by that failed attempt. Added a concrete marker and rebuilt successfully before publication.
- Published initial verified assets in public-site commit `4dd15fb`; Pages accepted configuration with HTTPS enforced.
- Remote Pages deployment and live-site verification are checked separately from local production tests; results will be appended when confirmed.

### Operational Trade-offs

- Separate repositories preserve private source without a plan upgrade, at the cost of a small cross-repository publishing job and one restricted deploy key.
- The site itself is public, not team-authenticated. There is still no server-side diagram storage or live collaboration.
- GitHub Pages hosting uses the public-repository allowance; existing private-repository Actions usage still applies. No billing settings were changed.
