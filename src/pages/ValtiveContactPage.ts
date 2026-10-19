import { type Locator, type Page } from '@playwright/test';

export class ValtiveContactPage {
  private readonly contactUsLink: Locator;

  constructor(private readonly page: Page) {
    this.contactUsLink = page.getByRole('link', { name: 'Contact Us', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.contactUsLink.click();
    await this.page.waitForURL(/\/contact-valtive\/?$/);
  }
}
