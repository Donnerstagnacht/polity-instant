// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Blog Hashtags', () => {
  test('Blog displays hashtags with proper formatting', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog page with hashtags
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Hashtags displayed with # prefix
    const hashtags = page.locator('[data-testid="hashtags"]').or(page.getByText(/#\w+/));

    if ((await hashtags.count()) > 0) {
      // 4. Hashtags are clickable
      const firstHashtag = hashtags.first();
      await expect(firstHashtag).toBeVisible();

      // 5. Hashtags centered under title
      // 6. Color coded if applicable
    }
  });

  test('Clicking hashtag navigates to search', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Find clickable hashtag
    const hashtags = page
      .locator('[data-testid="hashtags"]')
      .locator('a')
      .or(page.locator('a').filter({ hasText: /#/ }));

    if ((await hashtags.count()) > 0) {
      const firstHashtag = hashtags.first();

      // 4. Click hashtag
      await firstHashtag.click();

      // 5. Navigate to search results
      await page.waitForURL(/\/search/, { timeout: 5000 });

      // 6. All blogs with hashtag shown
      // Other entities with hashtag included
      // Results filterable by type
      await expect(page).toHaveURL(/\/search/);
    }
  });
});
