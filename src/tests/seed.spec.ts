import { expect } from '@playwright/test';
import { test } from '../fixtures/calendly';

test('seed: open valtive and reach calendly', async ({ calendly }) => {
  await calendly.open();

  await expect(calendly.meetingHeading).toBeVisible();
  await expect(calendly.daySelectorHeading).toBeVisible();
  await expect(calendly.calendarTable).toBeVisible();
  await expect(calendly.displayedMonthStatus).toBeVisible();
});