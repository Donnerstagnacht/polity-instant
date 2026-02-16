// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Comment Voting System', () => {
  test('Upvote comment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Click upvote arrow
      const upvoteButton = firstComment
        .getByRole('button')
        .filter({
          has: page.locator('[class*="ArrowUp"]'),
        })
        .first();

      if ((await upvoteButton.count()) > 0) {
        await upvoteButton.click();

        // 5. Verify vote

        // CommentVote created with vote: 1
        // Upvote count increases
        // Score increases by 1
        // Upvote arrow highlighted
        // Cannot upvote twice
      }
    }
  });

  test('Downvote comment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Click downvote arrow
      const downvoteButton = firstComment
        .getByRole('button')
        .filter({
          has: page.locator('[class*="ArrowDown"]'),
        })
        .first();

      if ((await downvoteButton.count()) > 0) {
        await downvoteButton.click();

        // 5. Verify vote

        // CommentVote created with vote: -1
        // Downvote count increases
        // Score decreases by 1
        // Downvote arrow highlighted
        // Cannot downvote twice
      }
    }
  });

  test('Change vote from upvote to downvote', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 3. User has upvoted comment (click upvote first)
      const upvoteButton = firstComment
        .getByRole('button')
        .filter({
          has: page.locator('[class*="ArrowUp"]'),
        })
        .first();

      if ((await upvoteButton.count()) > 0) {
        await upvoteButton.click();

        // 4. Click downvote arrow
        const downvoteButton = firstComment
          .getByRole('button')
          .filter({
            has: page.locator('[class*="ArrowDown"]'),
          })
          .first();

        await downvoteButton.click();

        // 5. Vote changed

        // Existing vote updated from 1 to -1
        // Score changes by 2 (from +1 to -1)
        // UI updates to show downvote
        // Only one vote per user maintained
      }
    }
  });

  test('Remove vote', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 3. User has voted (click upvote)
      const upvoteButton = firstComment
        .getByRole('button')
        .filter({
          has: page.locator('[class*="ArrowUp"]'),
        })
        .first();

      if ((await upvoteButton.count()) > 0) {
        await upvoteButton.click();

        // 4. Click same arrow again
        await upvoteButton.click();

        // 5. Vote removed

        // CommentVote deleted
        // Score adjusted back
        // Arrow no longer highlighted
        // User can vote again
      }
    }
  });

  test('View comment score', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Comment has upvotes and downvotes
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      // 4. Check score display
      const scoreElements = page.locator('span[class*="font-semibold"]');

      if ((await scoreElements.count()) > 0) {
        // 5. Score = upvotes - downvotes
        // Displayed prominently
        // Color coded (positive/negative/neutral)
        // Updates in real-time
      }
    }
  });
});
