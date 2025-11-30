// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Load Search Page', () => {
  test('User accesses the search page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Verify page loads with search interface
    await expect(page.getByRole('heading', { name: /search/i })).toBeVisible();

    // 4. Search input box prominently displayed
    const searchInput = page.getByPlaceholder(/search for anything/i);
    await expect(searchInput).toBeVisible();

    // 5. Entity type tabs visible
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /users/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /groups/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /blogs/i })).toBeVisible();
  });
});
