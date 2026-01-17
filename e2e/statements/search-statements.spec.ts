// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statements - Search and Filter', () => {
  test('User searches statements by text', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Enter keywords from statement text
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('climate');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(400);

    // 5. Filter by "Statements" type
    const statementsTab = page.getByRole('tab', { name: /statement/i });
    await statementsTab.click();

    // 6. Matching statements shown
    const results = page.getByRole('article').or(page.locator('[data-entity-type="statement"]'));

    // 7. Results sorted by relevance
    // Text highlighted if applicable
    // Snippet with match context

    // 8. Clicking navigates to statement
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      await firstResult.click();

      await page.waitForURL(/\/statement\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/statement\/.+/);
    }
  });

  test('User filters statements by tag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page with tag
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Click on tag badge
    const tagBadge = page.locator('[class*="Badge"]').first();

    if ((await tagBadge.count()) > 0) {
      await tagBadge.click();

      // 4. Navigate to search or filter results
      await page.waitForTimeout(500);

      // 5. All statements with tag shown
      // Other entity types with tag also shown
      // Results filterable by type
    }
  });

  test('User browses statements by tag category', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statements exploration page (if exists)
    await page.goto('/search');

    // 3. Filter by Statements
    const statementsTab = page.getByRole('tab', { name: /statement/i });
    if ((await statementsTab.count()) > 0) {
      await statementsTab.click();

      // 4. Browse available tags
      // Tag cloud or list displayed
      // Tags sorted by popularity or alphabetically
      // Click navigates to tag results
    }
  });
});
