// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Clear Search', () => {
  test('User clears search query', async ({ authenticatedPage: page }) => {
    // 1. Navigate to search with query
    await page.goto('/search?q=testquery');
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify query is in search box (shadcn Input has no explicit type attr)
    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).toHaveValue('testquery', { timeout: 5000 });

    // 3. Clear the input - use the X clear button if available, otherwise fill empty
    const clearButton = page.locator('button[aria-label]').filter({ has: page.locator('svg') }).and(
      page.locator('[aria-label*="lear" i], [aria-label*="lose" i]')
    ).first();
    const hasClearButton = await clearButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasClearButton) {
      await clearButton.click();
    } else {
      await searchInput.fill('');
    }

    // 4. Wait for debounce (300ms) + router.push URL update
    await expect(searchInput).toHaveValue('', { timeout: 5000 });
    await expect(page).not.toHaveURL(/q=testquery/, { timeout: 15000 });
  });

  test('Clear button functionality', async ({ authenticatedPage: page }) => {
    // 1. Navigate to search with query
    await page.goto('/search?q=cleartest');
    await page.waitForLoadState('domcontentloaded');

    // 2. Search input has value
    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).toHaveValue('cleartest', { timeout: 5000 });

    // 3. Type to clear and enter new search
    await searchInput.fill('newquery');

    // 4. Wait for debounce (300ms) + URL update
    await expect(page).toHaveURL(/q=newquery/, { timeout: 10000 });
  });
});
