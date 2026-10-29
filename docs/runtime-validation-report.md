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
