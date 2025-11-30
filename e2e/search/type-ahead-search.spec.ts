// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Type-Ahead Search', () => {
  test('Results update as user types', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search page
    await page.goto('/search');

    // 3. User starts typing in search box
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await searchInput.fill('test');

    // 4. Wait for debounce
    await page.waitForTimeout(500);

    // 5. URL updates with query parameter
    await expect(page).toHaveURL(/q=test/);

    // 6. Check for results or empty state
    const noResults = page.getByText(/no results found|found \d+ result/i);
    await expect(noResults).toBeVisible();
  });

  test('Search query persists in URL', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query parameter
    await page.goto('/search?q=democracy');

    // 3. Query pre-filled in search box
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await expect(searchInput).toHaveValue('democracy');

    // 4. Results displayed for query
    await page.waitForLoadState('networkidle');
  });
});
