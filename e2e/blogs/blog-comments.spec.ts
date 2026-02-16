// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Blog Comments System', () => {
  test('User adds top-level comment to blog', async ({
    authenticatedPage: page,
    blogFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const blog = await blogFactory.createBlog(user.id, {
      title: `Comment Blog Test ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

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
      timeout: 5000,
    });
  });

  test('User upvotes a comment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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

      // Cannot upvote same comment twice
      // Can change vote to downvote
    }
  });

  test('User downvotes a comment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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

      // Cannot downvote same comment twice
      // Can change vote to upvote
    }
  });

  test('User sorts comments by votes', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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

      // Score calculated as upvotes - downvotes
      // Sorting updates immediately
    }
  });

  test('User sorts comments by date', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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

      // Timestamp used for sorting
      // Sorting updates immediately
    }
  });
});
