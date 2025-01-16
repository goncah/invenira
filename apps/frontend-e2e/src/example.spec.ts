import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Locate the div with the content
  const div = page.locator('div', { hasText: 'Inven!RA' });

  // Assert that the div exists
  await expect(div).toHaveCount(6);
});
