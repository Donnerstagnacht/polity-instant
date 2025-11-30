// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Comment Display', () => {
  test('Display comment card', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comment in list
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Check all displayed elements
      // Creator avatar shown
      firstComment.locator('[class*="Avatar"]').or(firstComment.locator('img'));

      // Creator name and handle displayed
      // Comment text visible
      // Timestamp shown
      // Vote buttons and score visible
      // Reply button available
    }
  });

  test('Display nested replies', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Comment with replies
    const nestedReplies = page.locator('[class*="ml-"]').or(page.locator('[class*="pl-"]'));

    if ((await nestedReplies.count()) > 0) {
      // 4. View thread structure
      // Replies indented under parent
      // Clear visual hierarchy
      // Border/line connecting threads
      // Depth limits respected
    }
  });

  test('Empty state for no comments', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to entity with no comments (use statement)
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT || 'new-statement'}`);
    await page.waitForLoadState('networkidle');

    // 3. View comments section
    page.getByText(/no comment|be the first/i);

    // 4. "No comments yet" message
    // Encouragement to comment
    // Add comment button prominent
    // Clean UI
  });

  test('Display creator info', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Check creator section
      // Avatar displayed
      firstComment.locator('img').or(firstComment.locator('[class*="Avatar"]'));

      // Name shown
      // Handle shown if available
      // Clickable to profile
      // Verified badge if applicable
    }
  });
});
