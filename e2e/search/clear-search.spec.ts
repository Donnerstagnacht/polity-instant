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
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toHaveValue('testquery');

    // 4. Clear the search input
    await searchInput.clear();

    // 5. Wait for debounce (300ms)
    await page.waitForTimeout(500);

    // 6. URL updates (query parameter removed or empty)
    const url = page.url();
    expect(url).not.toContain('q=testquery');

    // 7. Search input is empty
    await expect(searchInput).toHaveValue('');
  });

  test('Clear button functionality', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=cleartest');

    // 3. Search input has value
    const searchInput = page.getByPlaceholder(/search groups, events, amendments, users/i);
    await expect(searchInput).toHaveValue('cleartest');

    // 4. Type to clear and enter new search
    await searchInput.clear();
    await searchInput.fill('newquery');

    // 5. Wait for update (300ms debounce)
    await page.waitForTimeout(500);

    // 6. URL reflects new query
    await expect(page).toHaveURL(/q=newquery/);
  });
});
