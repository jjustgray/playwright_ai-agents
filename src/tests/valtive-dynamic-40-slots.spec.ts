import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import type { CalendlyBookingPage } from '../pages/CalendlyBookingPage';
import { test } from '../fixtures/calendly';

class BookingAttemptBlockedError extends Error {}

async function selectNextUniqueSlot(
  calendly: CalendlyBookingPage,
  iterationIndex: number,
  attemptedSlots: Set<string>,
): Promise<{ dateLabel: string; timeLabel: string } | null> {
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const dayCount = await calendly.availableDayCount();

    if (dayCount === 0) {
      if (!(await calendly.goToNextMonth())) {
        return null;
      }
      continue;
    }

    for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
      const dayIndex = (iterationIndex - 1 + dayOffset) % dayCount;
      const dateLabel = await calendly.selectDay(dayIndex);
      const slotCount = await calendly.availableTimeSlotCount();

      for (let slotOffset = 0; slotOffset < slotCount; slotOffset++) {
        const slotIndex = (iterationIndex - 1 + slotOffset) % slotCount;
        const timeLabel = await calendly.timeSlotLabel(slotIndex);
        if (attemptedSlots.has(`${dateLabel}|${timeLabel}`)) {
          continue;
        }

        await calendly.selectTimeSlot(slotIndex);
        await calendly.continueToInviteeDetails();
        return { dateLabel, timeLabel };
      }

      await calendly.returnToCalendar();
    }

    if (!(await calendly.goToNextMonth())) {
      return null;
    }
  }

  return null;
}

test(qase(123, 'Books 40 unique Valtive slots and confirms each invitation'), async ({
  calendly,
  valtiveContact,
  bookingEmail,
}) => {
  test.setTimeout(15 * 60 * 1000);

  const attemptedSlots = new Set<string>();
  const confirmedSlots = new Set<string>();
  const blockedOutcomes: string[] = [];
  let noSlotsAvailable = false;

  for (let iterationIndex = 1; iterationIndex <= 40; iterationIndex++) {
    await test.step(`Booking attempt ${iterationIndex}`, async () => {
      await valtiveContact.open();
      await calendly.waitForWidget();
      await expect(calendly.meetingHeading).toBeVisible();
      await expect(calendly.daySelectorHeading).toBeVisible();
      await expect(calendly.calendarTable).toBeVisible();

      const selected = await selectNextUniqueSlot(calendly, iterationIndex, attemptedSlots);
      if (selected === null) {
        noSlotsAvailable = true;
        const message =
          `Booking attempt ${iterationIndex}: did not succeed — no unique slot was available.`;
        console.log(message);
        test.info().annotations.push({ type: 'booking-blocker', description: message });
        await test.step('Result: no unique slot available', async () => {
          throw new BookingAttemptBlockedError(message);
        });
        throw new BookingAttemptBlockedError(message);
      }

      const slotKey = `${selected.dateLabel}|${selected.timeLabel}`;
      attemptedSlots.add(slotKey);

      await expect(calendly.firstNameField).toBeVisible();
      await expect(calendly.lastNameField).toBeVisible();
      await expect(calendly.emailField).toBeVisible();
      await expect(calendly.scheduleButton).toBeVisible();
      await calendly.fillInviteeDetails(iterationIndex, bookingEmail(iterationIndex));

      const outcome = await calendly.submitAndDetectOutcome();
      if (outcome === 'captcha') {
        const message = `Booking attempt ${iterationIndex}: did not succeed — CAPTCHA.`;
        console.log(message);
        test.info().annotations.push({ type: 'booking-blocker', description: message });
        await test.step('Result: blocked by CAPTCHA', async () => {
          throw new BookingAttemptBlockedError(message);
        });
        throw new BookingAttemptBlockedError(message);
      }
      if (outcome === 'booking-blocked') {
        await expect(calendly.bookingCannotBeCompletedMessage).toBeVisible();
        const message =
          `Booking attempt ${iterationIndex}: did not succeed — ` +
          `Calendly showed "This booking cannot be completed."`;
        console.log(message);
        test.info().annotations.push({ type: 'booking-blocker', description: message });
        await test.step('Result: Calendly blocked the booking', async () => {
          throw new BookingAttemptBlockedError(message);
        });
        throw new BookingAttemptBlockedError(message);
      }

      await test.step(
        `Confirmed booking: ${selected.dateLabel} at ${selected.timeLabel}`,
        async () => {
          await expect(calendly.scheduledMessage).toBeVisible();
          await expect(calendly.invitationMessage).toBeVisible();
          console.log(
            `Booking attempt ${iterationIndex}: succeeded — ${selected.dateLabel} at ${selected.timeLabel}.`,
          );
          confirmedSlots.add(slotKey);
        },
      );
    }).catch((error: unknown) => {
      if (!(error instanceof BookingAttemptBlockedError)) {
        throw error;
      }
      blockedOutcomes.push(error.message);
    });

    if (noSlotsAvailable) {
      break;
    }
  }

  expect(
    confirmedSlots.size,
    `${blockedOutcomes.length} booking attempts were blocked or could not find a slot.`,
  ).toBe(40);
});
