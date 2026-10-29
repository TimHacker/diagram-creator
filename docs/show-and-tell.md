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
- [Initial Pages deployment](https://github.com/TimHacker/diagram-creator-site/actions/runs/40893444138) completed successfully.
- [Production acceptance and publishing workflow](https://github.com/TimHacker/diagram-creator/actions/runs/40893698447) passed both jobs: acceptance and restricted-key publishing.
- Live HTTPS suite: 13 passed, 0 failed (exit 0), including saving/reloading, offline export and whole-diagram PNG pixels.
- HTTPS returned 200 with HTML matching the verified production output; HTTP redirected to HTTPS. Source visibility remained PRIVATE and site-output visibility PUBLIC.
- Deployed desktop and mobile layouts were inspected. At 390 x 844, Properties starts exactly at the canvas bottom with no horizontal overflow.

### Operational Trade-offs

- Separate repositories preserve private source without a plan upgrade, at the cost of a small cross-repository publishing job and one restricted deploy key.
- The site itself is public, not team-authenticated. There is still no server-side diagram storage or live collaboration.
- GitHub Pages hosting uses the public-repository allowance; existing private-repository Actions usage still applies. No billing settings were changed.

## 2026-10-29: Public Source Review

- User requested a public main repository and single-repository deployment, conditional on there being no sensitive content.
- Gitleaks 8.30.1 scanned all three reachable Git commits, approximately 146 KB: no leaks found, exit 0. No detected credential values were printed.
- Reviewed tracked files, decision logs, issue bodies/comments and commit identities. No confidential application data or embedded credentials were identified in the reviewed content.
- Existing author and committer metadata contains the user's work email address. Making the repository public would expose that metadata; a clean credential scan does not establish consent to disclose personal information.
- Asked whether that existing metadata could be published; the user was unavailable to confirm. Kept the main repository private and the current live site and publishing workflow unchanged.
- No history rewrite, repository deletion, visibility change or deployment-key revocation was performed.
- Next decision: explicit confirmation that the existing commit metadata may become public, or a separately agreed history-privacy approach. Once resolved, migrate Pages to the main repository, replace the cross-repository key with native Pages permissions, and verify the replacement before retiring the old setup.

## 2026-10-29: Public Repository Migration

- User explicitly approved going public and moving hosting after the work-email disclosure warning. Existing history is retained; no force push or history rewrite.
- Main repository visibility verified PUBLIC; native Actions-based Pages enabled with HTTPS enforced.
- New URL: `https://timhacker.github.io/diagram-creator/`. The legacy output repository is retained, not deleted.
- Replace cross-repository SSH publishing with native Pages artefact upload and deployment, gated by the same production acceptance job. Deployment alone receives Pages write and identity-token permissions.
- Focused production-path check passed at `/diagram-creator/` after a successful TypeScript/Vite build. Full local, CI and live results are recorded below as verified.
- Both Pages project URLs share the same origin and local-storage key; the path change does not itself isolate existing saved diagrams. Localhost remains a separate origin.
- Migration commit `fea6f89`: all 13 production-preview tests passed; [native Pages CI and deployment](https://github.com/TimHacker/diagram-creator/actions/runs/40895386998) succeeded and the new HTTPS URL returned 200.

## 2026-10-29: Drag-to-Connect Arrows

- User requested a subagent to implement drag-and-drop arrows; implementation delegated with existing React Flow behaviour and ATDD constraints.
- [Issue 6](https://github.com/TimHacker/diagram-creator/issues/6) records Given/When/Then criteria and is added to the Project.
- Basic right-to-left handle dragging already existed. The missing capability was discoverable, generously sized handles and connections originating from all four sides; this is an enhancement, not a claim that no dragging existed.
- Subagent reported three new capability tests failing before implementation, followed by six passing drag tests and 19 passing production tests overall.
- Four perimeter handles use React Flow loose connection mode, with arrow direction determined by the drag origin. Same-shape and empty-canvas drops produce no edge or undo entry.
- Retain the hidden legacy target handle and right-first source ordering so saved edges without explicit handle IDs keep their original anchors. New edges persist their chosen sides without a schema change.
- Existing movement, pan, undo/redo, save/reload and property-panel connections remain covered. Touch dragging is not verified.
- An initial live run against the older deployment passed 11 checks but failed two newly strengthened checks expecting the new handle labels. This was a test/deployed-version mismatch; full live verification must follow the feature deployment.
- Parent verification: formatting, TypeScript/Vite build and all 19 production-preview tests passed before publishing feature commit `3c50904`.
- [Feature acceptance and native Pages deployment](https://github.com/TimHacker/diagram-creator/actions/runs/40896775931) passed both jobs. All 19 tests then passed against `https://timhacker.github.io/diagram-creator/`, resolving the mixed-version failures above.
- Only after live verification, removed the obsolete `PAGES_DEPLOY_KEY` source secret and legacy output-repository deploy key. Verified both absent; no repository deletion or old-site shutdown.
- Deployment issue 5 and arrow issue 6 closed with verification evidence; both Project items moved to Done. Source remains PUBLIC, Pages uses workflow deployment and HTTPS is enforced.

## 2026-10-29: Architecture Icon Packs

### Agreed Decisions

- [Issue 2](https://github.com/TimHacker/diagram-creator/issues/2): user chose Simple Icons (CC0) for cloud and vendor logos and Lucide (ISC, already bundled) for the provider-neutral pack.
- AWS and Azure logos are out of scope: Simple Icons no longer carries them, and the official architecture icon terms do not clearly permit redistribution in this public app.
- Eight icon scenarios (I1–I8) approved before implementation and [recorded on the issue](https://github.com/TimHacker/diagram-creator/issues/2#issuecomment-6500904643): packs listed with licences; add icon from either pack; cross-pack search; change/remove icon with undo; save/reload including legacy symbols; icons in PNG; offline use with no requests; third-party notice.

### Implementation Choices

- Icons are compiled into the bundle (23 Lucide, 27 Simple Icons), so nothing is fetched at runtime. Tree-shaking keeps the added JavaScript to about 43 kB before compression.
- Icon IDs are namespaced (`generic/database`, `cloud/kubernetes`). Diagrams saved with the earlier bare symbols (`database`, `queue` and so on) still open and map to the generic pack.
- Only Simple Icons entries without a separate per-icon licence are bundled; Apache Kafka (Apache-2.0) is therefore excluded. I8 checks this against the installed package data.

### ATDD Evidence

- Red baseline: `npm test -- tests/icons.spec.ts --workers 4 --timeout 5000` gave 8 failed, 0 passed, all for missing icon UI or notice file.
- After implementation, the icon spec gave 7 passed, 1 failed (missing `THIRD_PARTY_NOTICES.md`). After adding the notice: 8 passed.
- Full production-path gate: `npm run format:check`, `DEPLOY_BASE_PATH=/diagram-creator/ npm run build` and `PLAYWRIGHT_PRODUCTION=true npm test` all passed (27 passed, 0 failed).
- Desktop (1440 x 900) and mobile (390 x 844) layouts were inspected. On mobile the packs collapse to a single icon column, without search or pack headings.

### Limitations

- Brand logos remain trademarks of their owners; CC0 does not grant trademark rights.
- The main bundle is now slightly above Vite's 500 kB advisory threshold.
- Mobile has no icon search; users can scroll the column or choose icons in Properties.
