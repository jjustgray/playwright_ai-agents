import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const qaseReporter = [
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
] as const;

export default defineConfig({
  testDir: './src/tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  workers: 1,
  reporter:
    process.env.QASE_MODE === 'testops'
      ? [['html'], qaseReporter]
      : [['html']],
  use: {
    baseURL: process.env.BASE_URL || 'https://valtive.io',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
