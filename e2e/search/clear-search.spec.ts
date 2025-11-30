// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Clear Search', () => {
  test('User clears search query', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=testquery');

    // 3. Verify query is in search box
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await expect(searchInput).toHaveValue('testquery');

    // 4. Clear the search input
    await searchInput.clear();

    // 5. Wait for debounce
    await page.waitForTimeout(500);

    // 6. URL updates (query parameter removed)
    await expect(page).not.toHaveURL(/q=testquery/);

    // 7. Search input is empty
    await expect(searchInput).toHaveValue('');
  });

  test('Clear button functionality', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=cleartest');

    // 3. Search input has value
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await expect(searchInput).toHaveValue('cleartest');

    // 4. Type to clear and enter new search
    await searchInput.clear();
    await searchInput.fill('newquery');

    // 5. Wait for update
    await page.waitForTimeout(500);

    // 6. URL reflects new query
    await expect(page).toHaveURL(/q=newquery/);
  });
});
