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
      uploadAttachments: true, 
      api: {
        token: process.env.QASE_API_TOKEN,
      },
      run: {
        title: 'Playwright Automated Run',
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
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    headless: process.env.CI ? true : false,

    channel: 'chrome',

    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'Europe/Kyiv',
    viewport: { width: 1920, height: 1080 },

    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled', 
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-infobars',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});