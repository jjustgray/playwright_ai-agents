# Playwright AI Agents

This repository contains Playwright end-to-end tests for the Valtive meeting booking page. The main test suite exercises the Calendly widget: it discovers available dates and times, selects unique time slots, fills in invitee details, and checks whether submission results in a booking confirmation or a CAPTCHA. A separate smoke test supports manually solving a CAPTCHA.

Tests are located in `src/tests/`, and Playwright is configured in `playwright.config.ts`. Tests run in a visible Chromium window and use a persistent browser profile in `test-user-profile/`.

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

Configure these environment variables as needed:

| Variable | Description |
| --- | --- |
| `BASE_URL` | Base website URL. Defaults to `https://valtive.io`. |
| `QASE_API_TOKEN` | Qase API token used to publish test results. Leave empty if Qase reporting is not needed. |
| `RUN_LIVE_CALENDLY_BOOKINGS` | Set to `1` to enable live booking attempts. Disabled by default. |
| `CALENDLY_TEST_EMAIL` | Controlled test inbox for live bookings. Each attempt uses a unique `+valtive-...` email alias. |
| `RUN_CALENDLY_MANUAL_SMOKE` | Set to `1`, together with `RUN_LIVE_CALENDLY_BOOKINGS=1`, to enable the manual CAPTCHA smoke test. |

Do not commit real tokens or other secrets to version control.

## Running tests

Run the full test suite:

```bash
npx playwright test
```

Run the main test file:

```bash
npx playwright test src/tests/valtive-dynamic-40-slots.spec.ts
```

Tests that submit bookings are skipped unless `RUN_LIVE_CALENDLY_BOOKINGS=1` and `CALENDLY_TEST_EMAIL` are configured. Live tests can create calendar events and send invitations, so use a controlled test inbox and calendar. Automated attempts accept either a CAPTCHA or a booking confirmation as the submission outcome. To run the manual CAPTCHA smoke test as well, set `RUN_CALENDLY_MANUAL_SMOKE=1`.

## Reports and artifacts

Playwright writes the HTML report to `playwright-report/` and test results and artifacts to `test-results/`. Open the HTML report with:

```bash
npx playwright show-report
```
