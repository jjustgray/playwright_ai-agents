import { expect } from '@playwright/test';
import { test } from '../fixtures/calendly';

test('Manually solve CAPTCHA and verify booking confirmation', async ({ calendly, bookingEmail }) => {
  await calendly.open();
  await expect(calendly.meetingHeading).toBeVisible();
  await expect(calendly.daySelectorHeading).toBeVisible();

  const selected = await calendly.selectNextUniqueSlot(1, new Set<string>());
  if (selected === null) {
    test.skip(true, 'No unique slot is currently available for the manual smoke test.');
    return;
  }

  await expect(calendly.firstNameField).toBeVisible();
  await expect(calendly.lastNameField).toBeVisible();
  await expect(calendly.emailField).toBeVisible();
  await expect(calendly.scheduleButton).toBeVisible();

  await calendly.fillInviteeDetails(41, bookingEmail(41));
  const outcome = await calendly.submitAndWaitForManualCaptcha();

  expect(outcome).toBe('scheduled');
  await expect(calendly.scheduledMessage).toBeVisible();
  await expect(calendly.invitationMessage).toBeVisible();
});
