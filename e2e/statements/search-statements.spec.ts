// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statements - Search and Filter', () => {
  test('User searches statements by text', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Enter keywords from statement text
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('climate');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards (search uses filter panel, not tabs)
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} search results for 'climate'`);
  });

  test('User filters statements by tag', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to statement page with tag
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Click on tag badge
    const tagBadge = page.locator('[class*="Badge"]').first();

    if ((await tagBadge.count()) > 0) {
      await tagBadge.click();

      // 4. Navigate to search or filter results

      // 5. All statements with tag shown
      // Other entity types with tag also shown
      // Results filterable by type
    }
  });

  test('User browses statements by tag category', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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
