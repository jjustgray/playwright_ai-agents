import { test, expect } from '@playwright/test';

test('seed: open valtive and reach calendly', async ({ page }) => {
  await page.goto('/');
  const contactBtn = page.locator('a[href*="calendly"], button:has-text("Book")').first();
  await contactBtn.click();
  
  // Проверяем, что фрейм или виджет Calendly доступен
  const calendlyFrame = page.frameLocator('iframe[src*="calendly"]');
  await expect(calendlyFrame.locator('text="Select a Date & Time"').first()).toBeVisible();
});