# Runtime Validation Report

Date: 29 October 2026.

## Environment

- macOS; Node.js 25.3.0; npm 11.6.2.
- Playwright 1.64.1 with installed Chromium, running the real Vite-served React app.
- Browser-only application: no server-side API, authentication, database or container infrastructure to validate.
- Each test uses an isolated browser context and local storage. No test depends on pre-existing saved diagrams.

## Evidence

| Check                            | Result           | Exit Code | Evidence                                                                                                                                                                       |
| -------------------------------- | ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial A1 red run               | Expected failure | 1         | Blank app had no New diagram control.                                                                                                                                          |
| Full initial red run             | Expected failure | 1         | All 10 scenarios failed at the missing setup control, before implementation.                                                                                                   |
| Additional regression red run    | Expected failure | 1         | Mobile controls/layout and pointer-resize persistence failed before fixes.                                                                                                     |
| Full acceptance suite            | Pass             | 0         | `npm test -- --workers 4`: 12 passed, 0 failed.                                                                                                                                |
| Final rendering-sensitive checks | Pass             | 0         | Connector labels, PNG pixels, mobile layout and pointer-resize persistence: 4 passed.                                                                                          |
| Production build                 | Pass             | 0         | `npm run build`: TypeScript check and Vite production bundle succeeded.                                                                                                        |
| Formatting                       | Pass             | 0         | `npm run format:check`: all matched files passed.                                                                                                                              |
| Desktop visual inspection        | Pass             | n/a       | Browser screenshot inspected at 1440 x 900.                                                                                                                                    |
| Mobile layout inspection         | Pass             | n/a       | At 390 x 844, properties dock below the canvas; no horizontal overflow.                                                                                                        |
| Remote CI                        | Pass             | 0         | [Implementation workflow](https://github.com/TimHacker/diagram-creator/actions/runs/40889739085) passed installation, formatting, build, acceptance tests and evidence upload. |

## Coverage

The ten approved scenarios cover shape creation and selection, independent movement and resizing, shape and connector labels, attached connectors, deletion and restoration, undo/redo branching, explicit saving and reloading, whole-diagram image export and offline editing/saving/export after initial loading.

Additional regression checks cover mobile access to document controls and persistence of pointer-resized dimensions. PNG verification decodes the downloaded file and checks dimensions, non-blank pixels in both ends of a wide diagram and clear outer margins.

## Remaining Risks

- Chromium reports ResizeObserver notifications during pointer resizing. Tests pass, but the warning is not fixed or suppressed; tracked in [issue 4](https://github.com/TimHacker/diagram-creator/issues/4).
- Firefox, Safari, offline startup and cloud/team collaboration are not verified or claimed.
- Image sharing is verified. Editable interchange and durable backups are outside this release.
- Local checks and the implementation's remote CI run are green. This report is evidence for implementation commit `c6e45db`; subsequent documentation-only commits do not change the tested source.

## Deployment Verification

- Target: `https://timhacker.github.io/diagram-creator-site/`.
- Source remains private; only compiled site output is held in the public Pages repository.
- Deployment-path red check: 1 failed, exit 1, demonstrating root-relative production asset URLs before the fix.
- Deployment-path green check: 1 passed, exit 0, after fixing Vite's base path and the home link.
- Production-preview suite: 13 passed, 0 failed, exit 0, using `DEPLOY_BASE_PATH=/diagram-creator-site/ PLAYWRIGHT_PRODUCTION=true npm test -- --workers 4` after a production build.
- Formatting and production build passed, exit 0.
- Static-output assertion verified the Pages marker, absence of source maps, and absence of source/test folders before initial publication.
- Initial public-site asset commit: `4dd15fb`. [Pages deployment](https://github.com/TimHacker/diagram-creator-site/actions/runs/40893444138) and [production acceptance/publishing CI](https://github.com/TimHacker/diagram-creator/actions/runs/40893698447) both completed successfully.
- Live HTTPS suite: 13 passed, 0 failed, exit 0, using `PLAYWRIGHT_BASE_URL=https://timhacker.github.io/diagram-creator-site/ PLAYWRIGHT_PRODUCTION=true npm test -- --workers 4`.
- Live HTTPS returned 200 and exactly matched verified production HTML. HTTP redirected to HTTPS; source remained private and site output public.
- Deployed desktop/mobile screenshots were inspected; mobile Properties did not overlap the canvas and there was no horizontal overflow.

## Public-Source Privacy Gate

- Gitleaks 8.30.1 full-history scan: three commits, approximately 146 KB, no leaks found, exit 0.
- Commit author/committer metadata includes a work email address. Publication was initially held for explicit confirmation; the user subsequently approved going public and moving hosting. The successful credential scan is not a guarantee that all repository metadata is suitable for publication.

## Single-Repository Migration

- Main repository visibility verified PUBLIC; native Actions-based Pages configured with HTTPS enforced.
- New target: `https://timhacker.github.io/diagram-creator/`.
- TypeScript/Vite build and focused production asset/home-link regression passed at `/diagram-creator/` (1 test, exit 0).
- Legacy Pages site remains available during verification. No history rewrite or repository deletion.
