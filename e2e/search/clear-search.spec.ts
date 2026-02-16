// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Clear Search', () => {
  test('User clears search query', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search with query
    await page.goto('/search?q=testquery');

    // 3. Verify query is in search box
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toHaveValue('testquery');

    // 4. Click the clear button (ensure it's visible first)
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // 5. Wait for search input to be cleared first
    await expect(searchInput).toHaveValue('');

    // 6. Wait for debounce and URL update (300ms debounce + buffer)
    await page.waitForLoadState('domcontentloaded');

    // 7. Wait for URL to update
    await page.waitForURL(url => !url.searchParams.has('q') || url.searchParams.get('q') === '', {
      timeout: 5000,
    });

    // 8. Verify URL updates (query parameter removed or empty)
    await expect(page).not.toHaveURL(/q=testquery/);
  });

  test('Clear button functionality', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search with query
    await page.goto('/search?q=cleartest');

    // 3. Search input has value
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toHaveValue('cleartest');

    // 4. Type to clear and enter new search
    await searchInput.clear();
    await searchInput.fill('newquery');

    // 5. Wait for update (300ms debounce)

    // 6. URL reflects new query
    await expect(page).toHaveURL(/q=newquery/);
  });
});
