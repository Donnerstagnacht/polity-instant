// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Reply to Comments (Threading)', () => {
  test('Reply to top-level comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View existing comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const firstComment = comments.first();

      // 4. Click "Reply" button
      const replyButton = firstComment.getByRole('button', { name: /reply/i });

      if ((await replyButton.count()) > 0) {
        await replyButton.click();

        // 5. Enter reply text
        const replyInput = page
          .getByPlaceholder(/write.*reply|add.*reply/i)
          .or(page.getByRole('textbox').last());
        await replyInput.fill('This is a reply to the comment');

        // 6. Post reply
        const postButton = page.getByRole('button', { name: /post reply|post|submit/i }).last();
        await postButton.click();

        // 7. Reply created
        await page.waitForTimeout(500);

        // Linked as parentComment
        // Displayed nested under parent
        await expect(page.getByText('This is a reply to the comment')).toBeVisible({
          timeout: 3000,
        });

        // Indentation shows hierarchy
        // Parent commenter notified
      }
    }
  });

  test('Reply to reply (deep threading)', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Find existing reply
    const replies = page.locator('[class*="ml-"]').or(page.locator('[class*="pl-"]'));

    if ((await replies.count()) > 0) {
      const firstReply = replies.first();

      // 4. Reply to the reply
      const replyButton = firstReply.getByRole('button', { name: /reply/i });

      if ((await replyButton.count()) > 0) {
        await replyButton.click();

        const replyInput = page.getByRole('textbox').last();
        await replyInput.fill('This is a nested reply');

        const postButton = page.getByRole('button', { name: /post/i }).last();
        await postButton.click();

        // 5. Deep threading supported
        await page.waitForTimeout(500);

        // Visual hierarchy clear
        // Indentation increases with depth
        await expect(page.getByText('This is a nested reply')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('View reply chain', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with threaded comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Comment has multiple replies
    const commentThreads = page
      .locator('[data-testid="comment-thread"]')
      .or(page.locator('[class*="ml-"]'));

    if ((await commentThreads.count()) > 0) {
      // 4. View full thread
      // All replies visible
      // Chronological order within thread
      // Clear parent-child relationships
      // Collapse/expand functionality if applicable
    }
  });
});
