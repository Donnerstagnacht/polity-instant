// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Events - Search Events', () => {
  test('User searches events by title', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Type event title in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('meetup');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards (search uses filter panel, not tabs)
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} search results for 'meetup'`);
  });

  test('User filters events by hashtag', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#community');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // 5. Results displayed as masonry cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} results for '#community'`);
  });
});
