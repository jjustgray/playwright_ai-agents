import { test, expect } from '@playwright/test';

test('seed: open valtive and reach calendly', async ({ page }) => {
  await page.goto('https://valtive.io/contact-valtive/');

  const calendlyFrame = page.frameLocator('iframe[src*="calendly"]');
  await expect(calendlyFrame.getByRole('heading', { name: '30 Minute Meeting' })).toBeVisible();
  await expect(calendlyFrame.getByRole('heading', { name: 'Select a Day' })).toBeVisible();
});