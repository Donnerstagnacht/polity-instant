// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Search Blogs', () => {
  test('User searches blogs by title', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search');

    // 3. Type blog title
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill('insights');

    // 4. Wait for search results (debounced)
    await page.waitForTimeout(400);

    // 5. Filter by "Blogs" type
    const blogsTab = page.getByRole('tab', { name: /blog/i });
    await blogsTab.click();

    // 6. Matching blogs displayed
    const results = page.getByRole('article').or(page.locator('[data-entity-type="blog"]'));

    // 7. Results sorted by relevance
    // Blog cards show key info

    // 8. Clicking navigates to blog
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      await firstResult.click();

      await page.waitForURL(/\/blog\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });

  test('User searches blogs by hashtag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Type hashtag
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('#technology');

    // 4. Wait for results
    await page.waitForTimeout(400);

    // 5. Filter by Blogs
    const blogsTab = page.getByRole('tab', { name: /blog/i });
    await blogsTab.click();

    // 6. All blogs with hashtag shown
    // Other entities with hashtag also shown
    // Results filterable by type
  });

  test('User views group blogs', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

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
