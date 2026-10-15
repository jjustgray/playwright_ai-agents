import { test as base, type BrowserContext } from '@playwright/test';
import { CalendlyBookingPage } from '../pages/CalendlyBookingPage';
import {
  buildBookingEmail,
  createPersistentBrowserContext
} from './helpers';

export type BookingFixtures = {
  calendly: CalendlyBookingPage;
  bookingEmail: (iterationIndex: number) => string;
  persistentContext: BrowserContext;
};

export const test = base.extend<BookingFixtures>({
  persistentContext: async ({}, use) => {
    const context = await createPersistentBrowserContext();
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
    await use((iterationIndex) => buildBookingEmail(iterationIndex));
  },
});
