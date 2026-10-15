import { chromium, type BrowserContext } from '@playwright/test';
import { join } from 'node:path';

export const runtimeEnv = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

export function buildBookingEmail(iterationIndex: number): string {
  const configuredEmail = runtimeEnv.CALENDLY_TEST_EMAIL;
  if (!configuredEmail) {
    throw new Error(
      'Set CALENDLY_TEST_EMAIL to a controlled test inbox before enabling live bookings.',
    );
  }

  const emailParts = configuredEmail.split('@');
  if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
    throw new Error('CALENDLY_TEST_EMAIL must be a valid email address.');
  }

  return `${emailParts[0]}+valtive-${Date.now()}-${iterationIndex}@${emailParts[1]}`;
}

export async function createPersistentBrowserContext(): Promise<BrowserContext> {
  const userDataDir = join(process.cwd(), 'test-user-profile');
  return chromium.launchPersistentContext(userDataDir, {
    headless: runtimeEnv.CI === 'true',
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
    ],
  });
}
