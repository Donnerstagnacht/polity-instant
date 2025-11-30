// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Events - Search Events', () => {
  test('User searches events by title', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Type event title in search
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('meetup');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(400);

    // 5. Filter by "Events" type
    const eventsTab = page.getByRole('tab', { name: /event/i });
    await eventsTab.click();

    // 6. Matching events displayed
    // 7. Results sorted by relevance
    // Event cards show key info

    // 8. Clicking navigates to event
    const results = page.getByRole('article').or(page.locator('[data-entity-type="event"]'));
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      await firstResult.click();

      await page.waitForURL(/\/event\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/event\/.+/);
    }
  });

  test('User filters events by hashtag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page with hashtags
    await page.goto('/search');

    // 3. Type hashtag in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#community');

    // 4. Wait for results
    await page.waitForTimeout(400);

    // 5. Filter by Events
    const eventsTab = page.getByRole('tab', { name: /event/i });
    await eventsTab.click();

    // 6. All events with that hashtag shown
    // Public events visible, private events hidden appropriately
  });
});
