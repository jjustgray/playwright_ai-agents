import { test as base } from '@playwright/test';
import { CalendlyBookingPage } from '../pages/CalendlyBookingPage';
import { ValtiveContactPage } from '../pages/ValtiveContactPage';
import { buildBookingEmail } from './helpers';

export type BookingFixtures = {
  calendly: CalendlyBookingPage;
  valtiveContact: ValtiveContactPage;
  bookingEmail: (iterationIndex: number) => string;
};

export const test = base.extend<BookingFixtures>({
  calendly: async ({ page }, use) => {
    await use(new CalendlyBookingPage(page));
  },
  valtiveContact: async ({ page }, use) => {
    await use(new ValtiveContactPage(page));
  },
  bookingEmail: async ({}, use) => {
    await use((iterationIndex) => buildBookingEmail(iterationIndex));
  },
});
