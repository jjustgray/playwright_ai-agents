import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['html'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        testops: {
          project: 'VAL',
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          run: {
            complete: true,
          },
          rootSuiteTitle: 'Playwright Automated Tests',
        },
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://valtive.io',
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'on',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});