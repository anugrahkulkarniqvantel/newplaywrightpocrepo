import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByText('No previously stored customer').click();
  await page.getByRole('alert').click();
});