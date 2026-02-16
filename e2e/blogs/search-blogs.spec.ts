// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Search Blogs', () => {
  test('User searches blogs by title', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Type blog title
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('insights');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards (search uses filter panel, not tabs)
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} search results for 'insights'`);
  });

  test('User searches blogs by hashtag', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#technology');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} results for '#technology'`);
  });

  test('User views group blogs', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. View blogs section
    const blogsTab = page.getByRole('tab', { name: /blog/i });
    if ((await blogsTab.count()) > 0) {
      await blogsTab.click();

      // 4. All group blogs listed
      page.getByRole('article');

      // 5. Blog cards with gradient backgrounds
      // Clickable to view full blog
      // Sorted by date
    }
  });
});
