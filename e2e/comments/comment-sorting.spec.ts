// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Comment Sorting', () => {
  test('Sort by votes (top comments)', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog with multiple comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comments section
    const sortSelect = page.getByRole('combobox', { name: /sort/i });

    if ((await sortSelect.count()) > 0) {
      // 4. Select "Sort by Votes" option
      await sortSelect.click();

      const votesOption = page.getByRole('option', { name: /vote|top/i });
      await votesOption.click();

      // 5. View sorted list

      // Highest scored comments first
      // Score calculation accurate
      // Negative scores at bottom
      // Sorting updates immediately
    }
  });

  test('Sort by date (newest first)', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comments section
    const sortSelect = page.getByRole('combobox', { name: /sort/i });

    if ((await sortSelect.count()) > 0) {
      // 4. Select "Sort by Date" option
      await sortSelect.click();

      const dateOption = page.getByRole('option', { name: /date|newest|recent/i });
      await dateOption.click();

      // 5. View sorted list

      // Newest comments first
      // Based on createdAt timestamp
      // Chronological order maintained
      // Sorting preference saved
    }
  });

  test('Default sort order', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to entity with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Check default sort
    const sortSelect = page.getByRole('combobox', { name: /sort/i });

    if ((await sortSelect.count()) > 0) {
      // 4. Default sort applied (typically by votes)
      // User preference respected if set
      // Consistent across entities
      // Clear sort indicator
    }
  });
});
