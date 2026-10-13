import { expect, test as base, type FrameLocator, type Locator, type Page, chromium, BrowserContext } from '@playwright/test';
import * as path from 'path';

type BookingFixtures = {
  calendly: CalendlyBookingPage;
  bookingEmail: (iterationIndex: number) => string;
  persistentContext: BrowserContext;
};

const runtimeEnv = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

const liveBookingsEnabled = runtimeEnv.RUN_LIVE_CALENDLY_BOOKINGS === '1';

class CalendlyBookingPage {
  private readonly frame: FrameLocator;
  private readonly url = 'https://valtive.io/contact-valtive/';

  constructor(private readonly page: Page) {
    this.frame = page.frameLocator('iframe[src*="calendly.com/valtive-qa/30min"]');
  }

  private async waitForCalendarLoaderToDisappear(): Promise<void> {
    await this.frame.locator('[data-testid="calendar-loader"]').waitFor({
      state: 'hidden',
      timeout: 30_000,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
    const calendlyEmbed = this.page.locator('iframe[src*="calendly.com/valtive-qa/30min"]');
    await calendlyEmbed.scrollIntoViewIfNeeded();
    await expect(this.frame.getByRole('heading', { name: '30 Minute Meeting' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.frame.getByRole('heading', { name: 'Select a Day' })).toBeVisible();
    await this.waitForCalendarLoaderToDisappear();
    await expect(this.frame.getByRole('table', { name: 'Select a Day' })).toBeVisible();
    await expect(this.frame.getByRole('status').filter({ hasText: /is now displayed/ })).toBeVisible();
  }

  private async availableDays(): Promise<Locator[]> {
    await this.waitForCalendarLoaderToDisappear();
    const renderedCalendarDates = this.frame.getByRole('button', {
      name: / - (?:No times available|Times available)$/,
    });
    await expect(renderedCalendarDates.first()).toBeVisible({ timeout: 30_000 });

    const days = this.frame.getByRole('button', { name: /Times available$/ });
    return Promise.all(Array.from({ length: await days.count() }, (_, index) => days.nth(index)));
  }

  private async availableTimeSlots(): Promise<Locator> {
    const markedSlots = this.frame.locator('[data-container="time-slot"]');
    if (await markedSlots.count()) {
      return markedSlots;
    }

    return this.frame.getByRole('button', { name: /^\d{1,2}:\d{2}$/ });
  }

  private async returnToCalendar(): Promise<void> {
    await this.frame.getByRole('button', { name: 'Go to previous page' }).click();
    await expect(this.frame.getByRole('heading', { name: 'Select a Day' })).toBeVisible();
  }

  async selectNextUniqueSlot(
    iterationIndex: number,
    bookedSlots: Set<string>,
  ): Promise<{ dateLabel: string; timeLabel: string } | null> {
    let days = await this.availableDays();
    let monthOffset = 0;

    while (days.length === 0 && monthOffset < 12) {
      const nextMonth = this.frame.getByRole('button', { name: 'Go to next month' });
      if (await nextMonth.isDisabled()) {
        break;
      }

      const monthStatus = this.frame.getByRole('status').filter({ hasText: /is now displayed/ });
      const previousMonthStatus = await monthStatus.innerText();
      await nextMonth.scrollIntoViewIfNeeded();
      await nextMonth.click();
      await expect
        .poll(() => monthStatus.innerText(), { timeout: 30_000 })
        .not.toBe(previousMonthStatus);
      await this.waitForCalendarLoaderToDisappear();
      await expect(
        this.frame.getByRole('button', { name: / - (?:No times available|Times available)$/ }).first(),
      ).toBeVisible({ timeout: 30_000 });
      monthOffset++;
      days = await this.availableDays();
    }
    if (!days.length) {
      return null;
    }

    for (let dayOffset = 0; dayOffset < days.length; dayOffset++) {
      const dayIndex = (iterationIndex - 1 + dayOffset) % days.length;
      const day = days[dayIndex];
      const dateLabel = await day.getAttribute('aria-label');
      if (!dateLabel) {
        throw new Error('An available Calendly date has no accessible label.');
      }

      const dayBox = await day.boundingBox();
      if (dayBox) {
        await this.page.mouse.move(dayBox.x + dayBox.width / 2, dayBox.y + dayBox.height / 2, { steps: 5 });
      }
      await day.scrollIntoViewIfNeeded();
      await day.click();

      const slots = await this.availableTimeSlots();
      const totalAvailable = await slots.count();
      if (!totalAvailable) {
        await this.returnToCalendar();
        continue;
      }

      const slotIndex = (iterationIndex - 1) % totalAvailable;
      const slot = slots.nth(slotIndex);
      const timeLabel = (await slot.innerText()).trim();
      const uniqueSlotKey = `${dateLabel}|${timeLabel}`;

      if (bookedSlots.has(uniqueSlotKey)) {
        await this.returnToCalendar();
        continue;
      }

      const slotBox = await slot.boundingBox();
      if (slotBox) {
        await this.page.mouse.move(slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2, { steps: 5 });
      }
      await slot.click();

      const nextButton = this.frame.getByRole('button', { name: `Next ${timeLabel}` });
      const nextBox = await nextButton.boundingBox();
      if (nextBox) {
        await this.page.mouse.move(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2, { steps: 5 });
      }
      await nextButton.click();
      await expect(this.frame.getByRole('heading', { name: 'Enter Details' })).toBeVisible();
      await expect(this.frame.getByRole('textbox', { name: 'First name *' })).toBeVisible({
        timeout: 30_000,
      });
      await expect(this.frame.getByRole('textbox', { name: 'Last name *' })).toBeVisible({
        timeout: 30_000,
      });
      await expect(this.frame.getByRole('textbox', { name: 'Email *' })).toBeVisible({
        timeout: 30_000,
      });
      await expect(this.frame.getByRole('button', { name: 'Schedule Event' })).toBeVisible({
        timeout: 30_000,
      });
      return { dateLabel, timeLabel };
    }

    throw new Error(`No unbooked unique time slot was available for iteration ${iterationIndex}.`);
  }

  async submitAndDetectOutcome(): Promise<'captcha' | 'scheduled'> {
    const scheduleButton = this.frame.getByRole('button', { name: 'Schedule Event' });
    await scheduleButton.scrollIntoViewIfNeeded();
    await scheduleButton.click();

    const scheduledMessage = this.frame.getByText(/You are scheduled!?/);
    const captchaPrompt = this.frame.getByText(/Confirm you['’]re human/i);
    const captchaChallenge = this.frame.locator('iframe[title*="recaptcha" i][title*="challenge" i]');
    const getOutcome = async (): Promise<'pending' | 'captcha' | 'scheduled'> => {
      if (await scheduledMessage.isVisible()) {
        return 'scheduled';
      }
      if (await captchaPrompt.isVisible() || await captchaChallenge.isVisible()) {
        return 'captcha';
      }
      return 'pending';
    };

    await expect
      .poll(getOutcome, {
        message: 'Wait for Calendly confirmation or a reCAPTCHA challenge',
        timeout: 15_000,
        intervals: [250, 500, 1_000],
      })
      .not.toBe('pending');

    const outcome = await getOutcome();
    if (outcome === 'pending') {
      throw new Error('Calendly confirmation or reCAPTCHA challenge disappeared after detection.');
    }

    if (outcome === 'scheduled') {
      await expect(scheduledMessage).toBeVisible();
      await expect(
        this.frame.getByText('A calendar invitation has been sent to your email address.'),
      ).toBeVisible();
    }

    return outcome;
  }

  async submitAndWaitForManualCaptcha(): Promise<void> {
    const outcome = await this.submitAndDetectOutcome();
    if (outcome === 'captcha') {
      console.info(
        'Solve the Calendly reCAPTCHA in the headed browser, then resume Playwright Inspector.',
      );
      await this.page.pause();
      await expect(this.frame.getByText(/You are scheduled!?/)).toBeVisible({ timeout: 60_000 });
    }

    await expect(
      this.frame.getByText('A calendar invitation has been sent to your email address.'),
    ).toBeVisible({ timeout: 30_000 });
  }

  async fillInviteeDetails(iterationIndex: number, email: string): Promise<void> {
    const inviteeFields = [
      this.frame.getByRole('textbox', { name: 'First name *' }),
      this.frame.getByRole('textbox', { name: 'Last name *' }),
      this.frame.getByRole('textbox', { name: 'Email *' }),
    ];

    for (const field of inviteeFields) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
    }

    await this.frame.getByRole('textbox', { name: 'First name *' }).scrollIntoViewIfNeeded();
    const fields = [
      {
        field: this.frame.getByRole('textbox', { name: 'First name *' }),
        value: `QA${iterationIndex}`,
      },
      {
        field: this.frame.getByRole('textbox', { name: 'Last name *' }),
        value: 'Automation',
      },
      {
        field: this.frame.getByRole('textbox', { name: 'Email *' }),
        value: email,
      },
    ];

    for (const { field, value } of fields) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
      
      const box = await field.boundingBox();
      if (box) {
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      }
      
      await field.pressSequentially(value, { delay: 80 });
    }
  }

  private async waitForHumanVerificationOrConfirmation(): Promise<void> {
    const scheduledMessage = this.frame.getByText(/You are scheduled!?/);
    const captchaPrompt = this.frame.getByText(/Confirm you['’]re human/i);
    const captchaChallenge = this.frame.locator(
      'iframe[title*="recaptcha" i][title*="challenge" i]',
    );
    let submissionState = 'pending';

    await expect
      .poll(
        async () => {
          if (await scheduledMessage.isVisible()) {
            submissionState = 'scheduled';
            return submissionState;
          }

          if (await captchaPrompt.isVisible() || await captchaChallenge.isVisible()) {
            submissionState = 'captcha';
            return submissionState;
          }

          return 'pending';
        },
        {
          message: 'Wait for booking confirmation or manual reCAPTCHA verification',
          timeout: 15_000,
          intervals: [250, 500, 1_000],
        },
      )
      .not.toBe('pending');

    if (submissionState === 'captcha') {
      console.info(
        'Calendly requires manual reCAPTCHA verification. Solve it in the headed browser, then resume Playwright Inspector.',
      );
      await this.page.pause();
    }
  }

  async submitAndVerifyConfirmation(): Promise<void> {
    const submitBtn = this.frame.getByRole('button', { name: 'Schedule Event' });
    const box = await submitBtn.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    }
    await submitBtn.click();

    await this.waitForHumanVerificationOrConfirmation();
    await expect(this.frame.getByText('You are scheduled!')).toBeVisible({ timeout: 30_000 });
    await expect(
      this.frame.getByText('A calendar invitation has been sent to your email address.', { exact: true }),
    ).toBeVisible();
  }
}

const test = base.extend<BookingFixtures>({
  persistentContext: async ({}, use) => {
    const userDataDir = path.join(process.cwd(), 'test-user-profile');
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: { width: 1280, height: 800 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-infobars',
      ],
    });
    await use(context);
    await context.close();
  },
  page: async ({ persistentContext }, use) => {
    const pages = persistentContext.pages();
    const page = pages.length > 0 ? pages[0] : await persistentContext.newPage();
    await use(page);
  },
  calendly: async ({ page }, use) => {
    await use(new CalendlyBookingPage(page));
  },
  bookingEmail: async ({}, use) => {
    await use((iterationIndex) => {
      const configuredEmail = runtimeEnv.CALENDLY_TEST_EMAIL;
      if (!configuredEmail) {
        throw new Error('Set CALENDLY_TEST_EMAIL to a controlled test inbox before enabling live bookings.');
      }

      const emailParts = configuredEmail.split('@');
      if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
        throw new Error('CALENDLY_TEST_EMAIL must be a valid email address.');
      }

      return `${emailParts[0]}+valtive-${Date.now()}-${iterationIndex}@${emailParts[1]}`;
    });
  },
});

const attemptedSlots = new Set<string>();

test.describe('Valtive dynamic 40-slot booking submissions', () => {
  test.describe.configure({ mode: 'serial' });

  for (let iterationIndex = 1; iterationIndex <= 40; iterationIndex++) {
    test(`Booking attempt ${iterationIndex}: accepts CAPTCHA or scheduled confirmation`, async ({
      calendly,
      bookingEmail,
    }) => {
      test.skip(
        !liveBookingsEnabled || !runtimeEnv.CALENDLY_TEST_EMAIL,
        'Set RUN_LIVE_CALENDLY_BOOKINGS=1 and CALENDLY_TEST_EMAIL to a controlled test inbox to submit bookings.',
      );

      await calendly.open();
      const selected = await calendly.selectNextUniqueSlot(iterationIndex, attemptedSlots);
      if (selected === null) {
        test.skip(true, `No unique slot is currently available for booking attempt ${iterationIndex}.`);
        return;
      }

      attemptedSlots.add(`${selected.dateLabel}|${selected.timeLabel}`);
      await calendly.fillInviteeDetails(iterationIndex, bookingEmail(iterationIndex));

      const outcome = await calendly.submitAndDetectOutcome();
      expect(['captcha', 'scheduled']).toContain(outcome);
    });
  }
});

test.describe('Valtive manual CAPTCHA smoke test', () => {
  test('Manually solve CAPTCHA if presented and verify the scheduled confirmation', async ({
    calendly,
    bookingEmail,
  }) => {
    test.skip(
      !liveBookingsEnabled ||
        runtimeEnv.RUN_CALENDLY_MANUAL_SMOKE !== '1' ||
        !runtimeEnv.CALENDLY_TEST_EMAIL,
      'Set RUN_LIVE_CALENDLY_BOOKINGS=1, RUN_CALENDLY_MANUAL_SMOKE=1 and CALENDLY_TEST_EMAIL for this live smoke test.',
    );

    await calendly.open();
    const selected = await calendly.selectNextUniqueSlot(1, new Set<string>());
    if (selected === null) {
      test.skip(true, 'No unique slot is currently available for the manual smoke test.');
      return;
    }

    await calendly.fillInviteeDetails(41, bookingEmail(41));
    await calendly.submitAndWaitForManualCaptcha();
  });
});

test.describe.skip('Legacy single-test 40-slot booking loop', () => {
  test('Books 40 dynamically discovered unique time slots', async ({ calendly, bookingEmail, page }) => {
    test.skip(
      !liveBookingsEnabled,
      'Live mode creates calendar events and sends invitations. Set RUN_LIVE_CALENDLY_BOOKINGS=1 to opt in.',
    );

    const bookedSlots = new Set<string>();

    for (let iterationIndex = 1; iterationIndex <= 40; iterationIndex++) {
      await test.step(`Open Calendly for booking ${iterationIndex}`, async () => {
        await calendly.open();
      });

      const selected = await test.step(`Select a unique available slot for booking ${iterationIndex}`, async () => {
        return calendly.selectNextUniqueSlot(iterationIndex, bookedSlots);
      });
      if (selected === null) {
        test.skip(
          true,
          `Calendly currently has no available unique slots for booking ${iterationIndex}; no event was created.`,
        );
        return;
      }
      bookedSlots.add(`${selected.dateLabel}|${selected.timeLabel}`);

      await test.step(`Fill invitee details for booking ${iterationIndex}`, async () => {
        await calendly.fillInviteeDetails(iterationIndex, bookingEmail(iterationIndex));
      });

      await test.step(`Submit booking ${iterationIndex} and verify confirmation`, async () => {
        await calendly.submitAndVerifyConfirmation();
      });

      if (iterationIndex < 40) {
        await page.goto('about:blank');
      }
    }
  });
});