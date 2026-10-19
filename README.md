# Playwright AI Agents

This repository contains Playwright end-to-end tests for the Valtive meeting booking page. The main test suite exercises the Calendly widget: it discovers available dates and times, selects unique time slots, fills in invitee details, and checks whether submission results in a booking confirmation or a CAPTCHA. A separate smoke test is intended for manually solving a CAPTCHA.

Tests are located in `src/tests/`, and Playwright is configured in `playwright.config.ts`. Tests use Playwright's standard isolated browser contexts and the Chromium Desktop Chrome project. The browser runs headless in GitHub Actions and with a visible window locally. Traces, videos, and screenshots are retained only for failed tests. The manual CAPTCHA smoke test is skipped in CI because it requires user interaction.

## Requirements

- Node.js 20 or later
- npm
- Access to the Valtive website and its Calendly widget

## Installation

Install dependencies and the Chromium browser:

```bash
npm ci
npx playwright install chromium
```

Create a `.env` file in the project root from `.env.example`. In PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure these environment variables:

| Variable | Description |
| --- | --- |
| `BASE_URL` | Base website URL. Defaults to `https://valtive.io`. |
| `QASE_MODE` | Set to `testops` to send results to Qase. Defaults to off, so local runs only use Playwright's HTML reporter. |
| `QASE_API_TOKEN` | Qase API token required when `QASE_MODE=testops`. |
| `CALENDLY_TEST_EMAIL` | Controlled test inbox required for booking attempts. Each attempt uses a unique `-valtive-${iterationIndex}` email alias. |

Replace the example inbox with a controlled test inbox before running booking tests. Do not commit real tokens or other secrets to version control.

## Running tests

Run the full test suite locally (Qase is off unless `QASE_MODE=testops` is set):

```bash
npm test
```

Run the main test file:

```bash
npm test -- src/tests/valtive-dynamic-40-slots.spec.ts
```

Open the most recent HTML report:

```bash
npm run report
```

Booking attempts need `CALENDLY_TEST_EMAIL`; if an available slot is found without this variable, the test fails rather than being skipped. Live tests can create calendar events and send invitations, so use a controlled test inbox and calendar. The 40-slot test runs as one sequential test with 40 reported steps, does not retry side-effecting bookings, and passes only when 40 unique slot confirmations and invitation messages are verified. CAPTCHA and Calendly booking-blocked outcomes are annotated and cause an expected test failure; running out of available unique slots also fails the final confirmation count.

The test suite does not attempt to disguise automation or bypass CAPTCHA. For reliable automated booking QA, coordinate with the site owner on an approved CAPTCHA-free test event/type, test mode, or allow-listed runner IP. Until such an arrangement exists, CAPTCHA and anti-bot blocks are reported as test limitations rather than worked around.

## GitHub Actions CI

The workflow in `.github/workflows/playwright.yml` is started manually with `workflow_dispatch` from the GitHub Actions tab. It is intentionally not triggered by pushes because the live booking test can create calendar events and send invitations. It uses Ubuntu and Node.js 20, installs Chromium's system dependencies on every run, restores the Chromium browser from cache when available (otherwise installs Chromium), then runs `npx playwright test`.

Configure these repository Actions settings:

- Repository variable `BASE_URL` — target website URL; if unset, the Playwright config uses `https://valtive.io`.
- Repository variable `QASE_MODE` — set to `testops` to publish results to Qase. This variable is not needed for local runs.
- Repository secret `QASE_API_TOKEN` — publishes results to Qase TestOps project `VAL`.
- Repository variable `CALENDLY_TEST_EMAIL` — controlled test inbox required for booking attempts.

The workflow uploads `test-results/` and `playwright-report/` as the `test-videos-and-reports` artifact, even when tests fail. Artifacts are retained for 30 days. Qase attachment uploads are enabled; Playwright's failure-only video and screenshot artifacts are passed through by the Qase reporter, and the dynamic test also attaches a final failure screenshot.

## Reports and artifacts

The published [GitHub Pages report](https://jjustgray.github.io/playwright_ai-agents/) is updated by a manual workflow run. When Qase reporting is enabled and the run is created, the workflow summary also links directly to that Qase run. Qase results are available in the [VAL project](https://app.qase.io/project/VAL). Playwright's HTML reporter writes to `playwright-report/`; failed-test traces, videos, screenshots, and other artifacts are written to `test-results/`. Open the HTML report locally with:

```bash
npx playwright show-report
```

## Known limitations

- Calendly may block automated bookings with CAPTCHA or “This booking cannot be completed.” The suite reports these outcomes and does not attempt to bypass bot protection. Reliable automated booking verification requires an approved CAPTCHA-free test event, test mode, or allow-listed runner IP from the site owner.
- The 40-booking test creates real events and sends invitations when bookings succeed. Run it manually, only with an approved test calendar and controlled inbox; do not re-enable push-triggered runs.
- [`specs/valtive-booking-plan.md`](./specs/valtive-booking-plan.md) is a historical planner artifact. Its individual file paths and October 2026 availability describe the plan-generation snapshot, not the current implementation or live calendar.
- Run changes on a feature branch and review CI before merging to the default branch. The live-booking workflow is manually triggered to avoid accidental bookings during development.
