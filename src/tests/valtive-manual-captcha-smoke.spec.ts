import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { runtimeEnv } from '../fixtures/helpers';
import { test } from '../fixtures/calendly';

test.skip(runtimeEnv.CI === 'true', 'Manual CAPTCHA verification requires a headed browser.');

test(qase(2, 'Manually solve CAPTCHA and verify booking confirmation'), async ({
  calendly,
  valtiveContact,
  bookingEmail,
}) => {
  await valtiveContact.open();
  await calendly.waitForWidget();
  await expect(calendly.meetingHeading).toBeVisible();
  await expect(calendly.daySelectorHeading).toBeVisible();

  let dayCount = await calendly.availableDayCount();
  let monthOffset = 0;
  while (dayCount === 0 && monthOffset < 12) {
    if (!(await calendly.goToNextMonth())) {
      break;
    }
    monthOffset++;
    dayCount = await calendly.availableDayCount();
  }
  if (dayCount === 0) {
    test.skip(true, 'No unique slot is currently available for the manual smoke test.');
  }

  const dayIndex = new Date().getDate() % dayCount;
  await calendly.selectDay(dayIndex);
  const slotCount = await calendly.availableTimeSlotCount();
  if (slotCount === 0) {
    test.skip(true, 'No time slot is currently available for the manual smoke test.');
  }
  const slotIndex = new Date().getHours() % slotCount;
  await calendly.selectTimeSlot(slotIndex);
  await calendly.continueToInviteeDetails();

  await expect(calendly.firstNameField).toBeVisible();
  await expect(calendly.lastNameField).toBeVisible();
  await expect(calendly.emailField).toBeVisible();
  await expect(calendly.scheduleButton).toBeVisible();

  await calendly.fillInviteeDetails(1, bookingEmail(1));
  // await calendly.fillRandomlyInviteDetails(bookingEmail(2));
  const outcome = await calendly.submitAndWaitForManualCaptcha();

  expect(outcome).toBe('scheduled');
  await expect(calendly.scheduledMessage).toBeVisible();
  await expect(calendly.invitationMessage).toBeVisible();
});
