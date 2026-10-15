import { expect } from '@playwright/test';
import { test } from '../fixtures/calendly';

const attemptedSlots = new Set<string>();

test.describe('Valtive dynamic 40-slot booking submissions', () => {
  for (let iterationIndex = 1; iterationIndex <= 40; iterationIndex++) {
    test(`Booking test ${iterationIndex}: accepts CAPTCHA or scheduled confirmation`, async ({
      calendly,
      bookingEmail,
    }) => {
      await calendly.open();
      await expect(calendly.meetingHeading).toBeVisible();
      await expect(calendly.daySelectorHeading).toBeVisible();
      await expect(calendly.calendarTable).toBeVisible();
      const selected = await calendly.selectNextUniqueSlot(iterationIndex, attemptedSlots);
      if (selected === null) {
        test.skip(true, `No unique slot is currently available for booking attempt ${iterationIndex}.`);
        return;
      }

      await expect(calendly.firstNameField).toBeVisible();
      await expect(calendly.lastNameField).toBeVisible();
      await expect(calendly.emailField).toBeVisible();
      await expect(calendly.scheduleButton).toBeVisible();
      attemptedSlots.add(`${selected.dateLabel}|${selected.timeLabel}`);
      await calendly.fillInviteeDetails(iterationIndex, bookingEmail(iterationIndex));

      const outcome = await calendly.submitAndDetectOutcome();
      expect(['captcha', 'scheduled']).toContain(outcome);
      if (outcome === 'scheduled') {
        await expect(calendly.scheduledMessage).toBeVisible();
        await expect(calendly.invitationMessage).toBeVisible();
      }
    });
  }
});