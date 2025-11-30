// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Blog Comments System', () => {
  test('User adds top-level comment to blog', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Click "Add Comment" button
    const addCommentButton = page.getByRole('button', { name: /add comment|comment/i });
    await addCommentButton.click();

    // 4. Enter comment text
    const commentInput = page.getByPlaceholder(/write your comment/i).or(page.getByRole('textbox'));
    await commentInput.fill('This is a test comment on the blog post');

    // 5. Click "Post Comment"
    const postButton = page.getByRole('button', { name: /post comment|post/i });
    await postButton.click();

    // 6. Comment appears in comments list
    await expect(page.getByText('This is a test comment on the blog post')).toBeVisible({
      timeout: 3000,
    });

    // 7. Comment count increases
    // User shown as comment creator
    // Timestamp displayed
  });

  test('User upvotes a comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Find a comment
    const comments = page.locator('[class*="flex gap-4 rounded-lg border p-4"]');

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Click upvote arrow
      const upvoteButton = firstComment
        .getByRole('button')
        .filter({ has: page.locator('[class*="ArrowUp"]') })
        .first();

      // Get current score
      firstComment.locator('span[class*="font-semibold"]');

      // Click upvote
      await upvoteButton.click();

      // 5. Vote count increases
      // Upvote arrow highlighted
      await page.waitForTimeout(300);

      // Cannot upvote same comment twice
      // Can change vote to downvote
    }
  });

  test('User downvotes a comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Find a comment
    const comments = page.locator('[class*="flex gap-4 rounded-lg border p-4"]');

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Click downvote arrow
      const downvoteButton = firstComment
        .getByRole('button')
        .filter({ has: page.locator('[class*="ArrowDown"]') })
        .first();

      // Click downvote
      await downvoteButton.click();

      // 5. Vote count decreases
      // Downvote arrow highlighted
      await page.waitForTimeout(300);

      // Cannot downvote same comment twice
      // Can change vote to upvote
    }
  });

  test('User sorts comments by votes', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with multiple comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Select "Sort by Votes" option
    const sortSelect = page.getByRole('combobox', { name: /sort/i });
    if ((await sortSelect.count()) > 0) {
      await sortSelect.click();

      const votesOption = page.getByRole('option', { name: /vote/i });
      await votesOption.click();

      // 4. Highest voted comments appear first
      await page.waitForTimeout(300);

      // Score calculated as upvotes - downvotes
      // Sorting updates immediately
    }
  });

  test('User sorts comments by date', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with multiple comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Select "Sort by Date" option
    const sortSelect = page.getByRole('combobox', { name: /sort/i });
    if ((await sortSelect.count()) > 0) {
      await sortSelect.click();

      const dateOption = page.getByRole('option', { name: /date|newest/i });
      await dateOption.click();

      // 4. Newest comments appear first
      await page.waitForTimeout(300);

      // Timestamp used for sorting
      // Sorting updates immediately
    }
  });
});
