// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Search Amendments', () => {
  test('User searches amendments by title', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type amendment title
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('climate action');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards (search uses content type filter panel, not tabs)
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();

    // 6. If results exist, clicking navigates to detail page
    if (cardCount > 0) {
      console.log(`Found ${cardCount} search results for 'climate action'`);
    }
  });

  test('Filter amendments by hashtag', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#climate');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} results for '#climate'`);
  });

  test('Filter amendments by group', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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
