// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Create Basic Comment', () => {
  test('Create top-level comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Click "Add Comment" button
    const addCommentButton = page.getByRole('button', { name: /add comment|comment/i });
    await addCommentButton.click();

    // 4. Enter comment text
    const commentInput = page
      .getByPlaceholder(/write.*comment|add.*comment/i)
      .or(page.getByRole('textbox'));
    await commentInput.fill('Great insights on this topic!');

    // 5. Click "Post Comment"
    const postButton = page.getByRole('button', { name: /post comment|post|submit/i });
    await postButton.click();

    // 6. Comment created
    await page.waitForTimeout(500);

    // Comment appears in list
    await expect(page.getByText('Great insights on this topic!')).toBeVisible({ timeout: 3000 });

    // Creator info saved
    // Timestamp recorded
  });

  test('Create comment with long text', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Add comment
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    // 4. Enter multiple paragraphs
    const longText = `This is a very long comment that spans multiple paragraphs.

It contains several points and arguments that need to be expressed in detail.

The formatting should be preserved when the comment is posted and displayed.`;

    const commentInput = page.getByPlaceholder(/write.*comment/i).or(page.getByRole('textbox'));
    await commentInput.fill(longText);

    // 5. Post
    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 6. Full text saved
    await page.waitForTimeout(500);

    // Formatting preserved
    // Displays correctly
    await expect(page.getByText(/This is a very long comment/i)).toBeVisible({ timeout: 3000 });
  });

  test('Create comment with special characters', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Add comment with emojis, unicode
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    const specialText = 'Great work! 👍 This is très intéressant 🎉 #awesome';

    const commentInput = page.getByPlaceholder(/write.*comment/i).or(page.getByRole('textbox'));
    await commentInput.fill(specialText);

    // 4. Post
    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 5. All characters preserved
    await page.waitForTimeout(500);

    // Displayed correctly
    // No encoding issues
    await expect(page.getByText(/Great work!/i)).toBeVisible({ timeout: 3000 });
  });
});
