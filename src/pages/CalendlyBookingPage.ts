import { errors, type FrameLocator, type Locator, type Page } from '@playwright/test';

export class CalendlyBookingPage {
  private static readonly embedSelector = 'iframe[src*="calendly.com/valtive-qa/30min"]';
  private static readonly meetingTitle = '30 Minute Meeting';
  private static readonly daySelectorTitle = 'Select a Day';
  private static readonly bookingCannotBeCompletedTitle = 'This booking cannot be completed.';
  private readonly frame: FrameLocator;
  private readonly calendlyEmbed: Locator;
  private readonly calendarLoader: Locator;
  private readonly availableDayButtons: Locator;
  private readonly visibleTimeSlots: Locator;
  private readonly previousPageButton: Locator;
  private readonly nextMonthButton: Locator;
  private readonly monthAvailabilityButtons: Locator;
  private readonly nextSlotButton: Locator;
  private readonly captchaPrompt: Locator;
  private readonly captchaChallenge: Locator;
  private readonly submissionOutcome: Locator;
  private currentDay: Locator;
  private currentTimeSlot: Locator;
  private monthStatusForPreviousValue: Locator;

  readonly meetingHeading: Locator;
  readonly daySelectorHeading: Locator;
  readonly calendarTable: Locator;
  readonly displayedMonthStatus: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly scheduleButton: Locator;
  readonly scheduledMessage: Locator;
  readonly invitationMessage: Locator;
  readonly bookingCannotBeCompletedMessage: Locator;

  constructor(private readonly page: Page) {
    this.frame = page.frameLocator(CalendlyBookingPage.embedSelector);
    this.calendlyEmbed = page.locator(CalendlyBookingPage.embedSelector);
    this.calendarLoader = this.frame.locator('[data-testid="calendar-loader"]');
    this.meetingHeading = this.frame.getByRole('heading', {
      name: CalendlyBookingPage.meetingTitle,
    });
    this.daySelectorHeading = this.frame.getByRole('heading', {
      name: CalendlyBookingPage.daySelectorTitle,
    });
    this.calendarTable = this.frame.getByRole('table', {
      name: CalendlyBookingPage.daySelectorTitle,
    });
    this.displayedMonthStatus = this.frame.getByRole('status').filter({
      hasText: /is now displayed/,
    });
    this.availableDayButtons = this.calendarTable.getByRole('button', {
      name: /Times available/,
    });
    this.currentDay = this.availableDayButtons;
    this.firstNameField = this.frame.getByRole('textbox', { name: 'First name *' });
    this.lastNameField = this.frame.getByRole('textbox', { name: 'Last name *' });
    this.emailField = this.frame.getByRole('textbox', { name: 'Email *' });
    this.scheduleButton = this.frame.getByRole('button', { name: 'Schedule Event' });
    this.scheduledMessage = this.frame.getByText(/You are scheduled!?/);
    this.invitationMessage = this.frame.getByText(
      'A calendar invitation has been sent to your email address.',
    );
    this.bookingCannotBeCompletedMessage = this.frame.getByRole('heading', {
      name: CalendlyBookingPage.bookingCannotBeCompletedTitle,
    });
    this.visibleTimeSlots = this.frame
      .locator('[data-container="time-slot"]')
      .or(this.frame.getByRole('button', { name: /^\d{1,2}:\d{2}\s*(am|pm)?$/i }))
      .filter({ visible: true });
    this.currentTimeSlot = this.visibleTimeSlots;
    this.previousPageButton = this.frame.getByRole('button', {
      name: 'Go to previous page',
    });
    this.nextMonthButton = this.frame.getByRole('button', { name: 'Go to next month' });
    this.monthAvailabilityButtons = this.frame.getByRole('button', {
      name: / - (?:No times available|Times available)$/,
    });
    this.nextSlotButton = this.frame.getByRole('button', { name: /^Next / });
    this.captchaPrompt = this.frame.getByText(/Confirm you['’]re human/i);
    this.captchaChallenge = this.frame.locator(
      'iframe[title*="recaptcha" i][title*="challenge" i]',
    );
    this.submissionOutcome = this.scheduledMessage
      .or(this.bookingCannotBeCompletedMessage)
      .or(this.captchaPrompt)
      .or(this.captchaChallenge)
      .filter({ visible: true });
    this.monthStatusForPreviousValue = this.displayedMonthStatus;
  }

  private async waitForCalendarLoaderToDisappear(): Promise<void> {
    await this.calendarLoader.waitFor({
      state: 'hidden',
      timeout: 30_000,
    });
  }

  async waitForWidget(): Promise<void> {
    await this.calendlyEmbed.scrollIntoViewIfNeeded();
    await this.meetingHeading.waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await this.daySelectorHeading.waitFor({ state: 'visible' });
    await this.waitForCalendarLoaderToDisappear();
    await this.calendarTable.waitFor({ state: 'visible' });
    await this.displayedMonthStatus.waitFor({ state: 'visible' });
  }

  async availableDayCount(): Promise<number> {
    await this.waitForCalendarLoaderToDisappear();
    return this.availableDayButtons.count();
  }

  async availableTimeSlotCount(): Promise<number> {
    try {
      await this.visibleTimeSlots.first().waitFor({ state: 'visible', timeout: 10_000 });
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        return 0;
      }
      throw error;
    }

    return this.visibleTimeSlots.count();
  }

  async returnToCalendar(): Promise<void> {
    await this.previousPageButton.click();
    await this.daySelectorHeading.waitFor({ state: 'visible' });
  }

  async goToNextMonth(): Promise<boolean> {
    if (await this.nextMonthButton.isDisabled()) {
      return false;
    }

    const previousMonthStatus = await this.displayedMonthStatus.innerText();
    await this.nextMonthButton.scrollIntoViewIfNeeded();
    await this.nextMonthButton.click();
    this.monthStatusForPreviousValue = this.displayedMonthStatus.filter({
      hasText: previousMonthStatus,
    });
    await this.monthStatusForPreviousValue.waitFor({ state: 'hidden', timeout: 30_000 });
    await this.waitForCalendarLoaderToDisappear();
    await this.monthAvailabilityButtons.first().waitFor({ state: 'visible', timeout: 30_000 });
    return true;
  }

  async selectDay(index: number): Promise<string> {
    this.currentDay = this.availableDayButtons.nth(index);
    const dateLabel = await this.currentDay.getAttribute('aria-label');
    if (!dateLabel) {
      throw new Error('An available Calendly date has no accessible label.');
    }

    await this.currentDay.scrollIntoViewIfNeeded();
    await this.currentDay.click();
    return dateLabel;
  }

  async timeSlotLabel(index: number): Promise<string> {
    return (await this.visibleTimeSlots.nth(index).innerText()).trim();
  }

  async selectTimeSlot(index: number): Promise<void> {
    this.currentTimeSlot = this.visibleTimeSlots.nth(index);
    await this.currentTimeSlot.click();
  }

  async continueToInviteeDetails(): Promise<void> {
    await this.nextSlotButton.click();
  }

  private async waitForSubmissionOutcome(): Promise<'captcha' | 'scheduled' | 'booking-blocked'> {
    await this.submissionOutcome.first().waitFor({ state: 'visible', timeout: 15_000 });

    if (await this.scheduledMessage.isVisible()) {
      return 'scheduled';
    }
    if (await this.bookingCannotBeCompletedMessage.isVisible()) {
      return 'booking-blocked';
    }

    return 'captcha';
  }

  async submitAndDetectOutcome(): Promise<'captcha' | 'scheduled' | 'booking-blocked'> {
    await this.scheduleButton.scrollIntoViewIfNeeded();
    await this.scheduleButton.click();
    return this.waitForSubmissionOutcome();
  }

  async submitAndWaitForManualCaptcha(): Promise<'captcha' | 'scheduled' | 'booking-blocked'> {
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
    await this.firstNameField.fill(`QA${iterationIndex}`);
    await this.lastNameField.fill('Automation');
    await this.emailField.fill(email);
  }

  async fillRandomlyInviteDetails(email: string): Promise<void> {
    const fieldsList = [
      'QA_manual_random',
      'Automation',
      email
    ];
    const fieldsLocators = [
      this.firstNameField, 
      this.lastNameField, 
      this.emailField
    ];

    for (let i = 0; i < Object.keys(fieldsList).length; i++) {
      for (const char of fieldsList[i]) {
        const randomDelay = Math.floor(Math.random() * 50) + 100;
        await fieldsLocators[i].press(char, { delay: randomDelay });
      }
    }
  }
}
