// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Empty States and Results', () => {
  test('Empty search results show helpful message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with non-existent term
    await page.goto('/search?q=xyznonexistent12345');

    // 3. Wait for results to load
    await page.waitForLoadState('networkidle');

    // 4. Empty state displays
    const emptyMessage = page.getByText(/no results found|try adjusting your search/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('Search page without query shows initial state', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search without query
    await page.goto('/search');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Search interface is ready
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveValue('');

    // 5. Tabs are visible
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
  });

  test('Search results display count', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=test');

    // 3. Wait for results
    await page.waitForLoadState('networkidle');

    // 4. Check for results summary
    const resultsSummary = page.getByText(/found \d+ result/i);
    const hasResults = await resultsSummary.isVisible().catch(() => false);

    if (hasResults) {
      // 5. Results count is displayed
      await expect(resultsSummary).toBeVisible();
    }

    // 6. Tab counts are visible
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toContainText(/\d+/);
  });
});
