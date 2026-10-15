# Playwright AI Agents

This repository contains Playwright end-to-end tests for the Valtive meeting booking page. The main test suite exercises the Calendly widget: it discovers available dates and times, selects unique time slots, fills in invitee details, and checks whether submission results in a booking confirmation or a CAPTCHA. A separate smoke test is intended for manually solving a CAPTCHA.

Tests are located in `src/tests/`, and Playwright is configured in `playwright.config.ts`. Tests run in Chromium and use a persistent browser profile in `test-user-profile/`.

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
| `QASE_API_TOKEN` | Qase API token used by the Qase TestOps reporter. |
| `CALENDLY_TEST_EMAIL` | Controlled test inbox required for booking attempts. Each attempt uses a unique `+valtive-...` email alias. |

Do not commit real tokens or other secrets to version control.
`CALENDLY_TEST_EMAIL` is not included in `.env.example`; add it to `.env` when running booking attempts.

## Running tests

Run the full test suite locally:

```bash
npx playwright test
```

Run the main test file:

```bash
npx playwright test src/tests/valtive-dynamic-40-slots.spec.ts
```

Booking attempts need `CALENDLY_TEST_EMAIL`; if an available slot is found without this variable, the test fails rather than being skipped. Live tests can create calendar events and send invitations, so use a controlled test inbox and calendar. Automated attempts accept either a CAPTCHA or a booking confirmation as the submission outcome.

## GitHub Actions CI

The workflow in `.github/workflows/playwright.yml` runs on pushes to `main` and `master`. It uses Ubuntu and Node.js 20, installs dependencies and Playwright browsers, then runs `npx playwright test`.

Add the following repository Actions secrets for the CI run:

- `QASE_API_TOKEN` — publishes results to Qase TestOps project `VAL`.
- `BASE_URL` — target website URL; if unset, the Playwright config uses `https://valtive.io`.
- `CALENDLY_TEST_EMAIL` — controlled test inbox required for booking attempts.

The workflow uploads `test-results/` and `playwright-report/` as the `test-videos-and-reports` artifact, even when tests fail. Artifacts are retained for 30 days.

## Reports and artifacts

Playwright's HTML reporter writes to `playwright-report/`; test results, videos, screenshots, and other artifacts are written to `test-results/`. Open the HTML report locally with:

```bash
npx playwright show-report
```
