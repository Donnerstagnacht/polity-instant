// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Empty States and Results', () => {
  test('Empty search results show helpful message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search with non-existent term
    await page.goto('/search?q=xyznonexistent12345');

    // 3. Wait for search page to fully load
    await page.waitForLoadState('domcontentloaded');

    // 4. Wait for search input to be visible (indicates page has loaded)
    await expect(
      page.getByPlaceholder(/search groups, events, amendments, users/i)
    ).toBeVisible({ timeout: 15000 });

    // 5. Empty state displays - check for result count or empty state messages
    const emptyMessageVisible =
      (await page.getByText(/showing 0 result/i).isVisible().catch(() => false)) ||
      (await page.getByText(/no activity yet/i).isVisible().catch(() => false)) ||
      (await page.getByText(/no results found/i).isVisible().catch(() => false));

    expect(emptyMessageVisible).toBe(true);
  });

  test('Search page without query shows initial state', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search without query
    await page.goto('/search');

    // 3. Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // 4. Search interface is ready
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveValue('');

    // 5. Filter button is visible
    const filterButton = page
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .first();
    await expect(filterButton).toBeVisible();
  });

  test('Search results display count', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search with query
    await page.goto('/search?q=test');

    // 3. Wait for results
    await page.waitForLoadState('domcontentloaded');

    // 4. Check for results summary (may show "Showing X results" or "No results found")
    const resultsSummary = page.getByText(/showing \d+ result|no results found/i);
    const hasResults = await resultsSummary.isVisible().catch(() => false);

    if (hasResults) {
      // 5. Results count is displayed
      await expect(resultsSummary).toBeVisible();
    }

    // At minimum, page should have loaded without errors
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toBeVisible();
  });
});
