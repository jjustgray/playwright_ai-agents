import { type FrameLocator, type Locator, type Page } from '@playwright/test';

export class CalendlyBookingPage {
  private static readonly embedSelector = 'iframe[src*="calendly.com/valtive-qa/30min"]';
  private static readonly meetingTitle = '30 Minute Meeting';
  private static readonly daySelectorTitle = 'Select a Day';
  private readonly frame: FrameLocator;
  private readonly url = 'https://valtive.io/contact-valtive/';

  constructor(private readonly page: Page) {
    this.frame = page.frameLocator(CalendlyBookingPage.embedSelector);
  }

  get meetingHeading(): Locator {
    return this.frame.getByRole('heading', { name: CalendlyBookingPage.meetingTitle });
  }

  get daySelectorHeading(): Locator {
    return this.frame.getByRole('heading', { name: CalendlyBookingPage.daySelectorTitle });
  }

  get calendarTable(): Locator {
    return this.frame.getByRole('table', { name: CalendlyBookingPage.daySelectorTitle });
  }

  get displayedMonthStatus(): Locator {
    return this.frame.getByRole('status').filter({ hasText: /is now displayed/ });
  }

  get firstNameField(): Locator {
    return this.frame.getByRole('textbox', { name: 'First name *' });
  }

  get lastNameField(): Locator {
    return this.frame.getByRole('textbox', { name: 'Last name *' });
  }

  get emailField(): Locator {
    return this.frame.getByRole('textbox', { name: 'Email *' });
  }

  get scheduleButton(): Locator {
    return this.frame.getByRole('button', { name: 'Schedule Event' });
  }

  get scheduledMessage(): Locator {
    return this.frame.getByText(/You are scheduled!?/);
  }

  get invitationMessage(): Locator {
    return this.frame.getByText('A calendar invitation has been sent to your email address.');
  }

  private async waitForCalendarLoaderToDisappear(): Promise<void> {
    await this.frame.locator('[data-testid="calendar-loader"]').waitFor({
      state: 'hidden',
      timeout: 30_000,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
    const calendlyEmbed = this.page.locator(CalendlyBookingPage.embedSelector);
    await calendlyEmbed.scrollIntoViewIfNeeded();
    await this.meetingHeading.waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await this.daySelectorHeading.waitFor({ state: 'visible' });
    await this.waitForCalendarLoaderToDisappear();
    await this.calendarTable.waitFor({ state: 'visible' });
    await this.displayedMonthStatus.waitFor({ state: 'visible' });
  }

  private async availableDays(): Promise<Locator[]> {
    await this.waitForCalendarLoaderToDisappear();

    const days = this.frame.locator('div[role="grid"] button:not([disabled])');
    await days.first().waitFor({ state: 'visible', timeout: 30_000 });

    const count = await days.count();
    const locators: Locator[] = [];
    for (let i = 0; i < count; i++) {
      locators.push(days.nth(i));
    }
    return locators;
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
    await this.daySelectorHeading.waitFor({ state: 'visible' });
  }

  private async waitForTextChange(locator: Locator, previousText: string): Promise<void> {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if ((await locator.innerText()) !== previousText) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Calendly did not update the displayed month in time.');
  }

  private async waitForSubmissionOutcome(): Promise<'captcha' | 'scheduled'> {
    const captchaPrompt = this.frame.getByText(/Confirm you['’]re human/i);
    const captchaChallenge = this.frame.locator('iframe[title*="recaptcha" i][title*="challenge" i]');
    const deadline = Date.now() + 15_000;

    while (Date.now() < deadline) {
      if (await this.scheduledMessage.isVisible()) {
        return 'scheduled';
      }
      if (await captchaPrompt.isVisible() || (await captchaChallenge.isVisible())) {
        return 'captcha';
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    throw new Error('Calendly did not show a booking confirmation or a reCAPTCHA challenge in time.');
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

      const monthStatus = this.displayedMonthStatus;
      const previousMonthStatus = await monthStatus.innerText();
      await nextMonth.scrollIntoViewIfNeeded();
      await nextMonth.click();
      await this.waitForTextChange(monthStatus, previousMonthStatus);
      await this.waitForCalendarLoaderToDisappear();
      await this.frame
        .getByRole('button', { name: / - (?:No times available|Times available)$/ })
        .first()
        .waitFor({ state: 'visible', timeout: 30_000 });
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

      await slot.click();

      const nextButton = this.frame.getByRole('button', { name: `Next ${timeLabel}` });
      await nextButton.click();
      await this.firstNameField.waitFor({ state: 'visible', timeout: 30_000 });
      await this.lastNameField.waitFor({ state: 'visible', timeout: 30_000 });
      await this.emailField.waitFor({ state: 'visible', timeout: 30_000 });
      await this.scheduleButton.waitFor({ state: 'visible', timeout: 30_000 });
      return { dateLabel, timeLabel };
    }

    throw new Error(`No unbooked unique time slot was available for iteration ${iterationIndex}.`);
  }

  async submitAndDetectOutcome(): Promise<'captcha' | 'scheduled'> {
    await this.scheduleButton.scrollIntoViewIfNeeded();
    await this.scheduleButton.click();
    return this.waitForSubmissionOutcome();
  }

  async submitAndWaitForManualCaptcha(): Promise<'captcha' | 'scheduled'> {
    const outcome = await this.submitAndDetectOutcome();
    if (outcome === 'captcha') {
      console.info(
        'Solve the Calendly reCAPTCHA in the headed browser, then resume Playwright Inspector.',
      );
      await this.page.pause();
      return this.waitForSubmissionOutcome();
    }
    return outcome;
  }

  async fillInviteeDetails(iterationIndex: number, email: string): Promise<void> {
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
      await field.click();
      
      for (const char of value) {
        const randomDelay = Math.max(50, Math.floor(Math.random() * 151));
        await field.press(char, { delay: randomDelay });
      }
    }
  }
}
