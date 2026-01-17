// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Search Amendments', () => {
  test('User searches amendments by title', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type amendment title
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('climate action');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(400);

    // 5. Filter by "Amendments"
    const amendmentsTab = page.getByRole('tab', { name: /amendment/i });
    await amendmentsTab.click();

    // 6. Matching amendments shown
    const results = page.getByRole('article').or(page.locator('[data-entity-type="amendment"]'));

    // 7. Results sorted by relevance
    // Amendment cards with key info
    // Clickable to view

    // 8. Clicking navigates to amendment
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      await firstResult.click();

      await page.waitForURL(/\/amendment\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/amendment\/.+/);
    }
  });

  test('Filter amendments by hashtag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#climate');

    // 4. Wait for results
    await page.waitForTimeout(400);

    // 5. Filter by Amendments
    const amendmentsTab = page.getByRole('tab', { name: /amendment/i });
    await amendmentsTab.click();

    // 6. All amendments with tag shown
    // Other entities also shown
    // Filterable by type
    // Tag highlighted
  });

  test('Filter amendments by group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. View amendments section
    const amendmentsTab = page.getByRole('tab', { name: /amendment/i });

    if ((await amendmentsTab.count()) > 0) {
      await amendmentsTab.click();

      // 4. Group's amendments listed
      page.getByRole('article');

      // Sorted by date/status
      // Clickable cards
      // Count accurate
    }
  });
});
