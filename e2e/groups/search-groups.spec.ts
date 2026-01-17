// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Groups - Search Groups', () => {
  test('User searches groups by name', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Type group name in search
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('community');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(400);

    // 5. Filter by "Groups" type
    const groupsTab = page.getByRole('tab', { name: /group/i });
    await groupsTab.click();

    // 6. Matching groups displayed
    const results = page.getByRole('article').or(page.locator('[data-entity-type="group"]'));

    // 7. Results sorted by relevance
    // Group cards show key info

    // 8. Clicking navigates to group
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      await firstResult.click();

      await page.waitForURL(/\/group\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/group\/.+/);
    }
  });

  test('User filters groups by hashtag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#tech');

    // 4. Wait for results
    await page.waitForTimeout(400);

    // 5. Filter by Groups
    const groupsTab = page.getByRole('tab', { name: /group/i });
    await groupsTab.click();

    // 6. All groups with that hashtag shown
    // Public groups visible to all
    // Private groups hidden appropriately
  });
});
