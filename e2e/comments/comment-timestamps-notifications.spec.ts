// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Timestamps and Notifications', () => {
  test('Display creation time', async ({ page }) => {
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

      // 4. Check timestamp
      firstComment.getByText(/ago|minute|hour|day|just now/i);

      // 5. Timestamp formatted (e.g., "2 hours ago")
      // Locale-aware formatting
      // Relative time updates
      // Hover shows exact time
    }
  });

  test('Display updated time', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Comment has been edited
    const editedIndicator = page.getByText(/edited/i);

    if ((await editedIndicator.count()) > 0) {
      // 4. Check updated timestamp
      // "Edited" indicator shown
      // Updated time displayed
      // Distinct from created time
      // Tooltip with exact edit time
    }
  });

  test('Notify of new comment', async ({ page }) => {
    // 1. User comments on blog
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Add comment
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    const commentInput = page.getByRole('textbox');
    await commentInput.fill('Test notification comment');

    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 4. Blog creator checks notifications
    await page.waitForTimeout(500);

    // Creator receives notification
    // Notification type: "comment_added"
    // Contains commenter info and snippet
    // Link to comment
  });

  test('Notify of reply', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User replies to comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      const replyButton = comments.first().getByRole('button', { name: /reply/i });

      if ((await replyButton.count()) > 0) {
        await replyButton.click();

        const replyInput = page.getByRole('textbox').last();
        await replyInput.fill('Test reply notification');

        const postButton = page.getByRole('button', { name: /post/i }).last();
        await postButton.click();

        // 4. Original commenter checks notifications
        await page.waitForTimeout(500);

        // Original commenter notified
        // Notification type: "comment_reply"
        // Shows reply text
        // Link to specific comment
      }
    }
  });
});
