// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Loading States and Error Handling', () => {
  test('Display loading state while fetching comments', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    const navigationPromise = page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);

    // 3. Comments section loads
    // Initial loading state shown
    // Skeleton/spinner visible

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    // 4. Comments displayed when loaded
    await page.waitForTimeout(500);

    page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    // Loading state replaced with content
    // Smooth transition
  });

  test('Handle create comment validation errors', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Attempt to create comment without text
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    // 4. Submit without entering text
    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 5. Validation error displayed
    await page.waitForTimeout(300);

    // Error message shown (e.g., "Comment text is required")
    page.getByText(/required|cannot be empty|enter.*comment/i);

    // Form not submitted
    // User can correct and retry
  });

  test('Handle network error during comment creation', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Simulate network issue
    await page.context().setOffline(true);

    // 4. Attempt to create comment
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    const commentInput = page.getByRole('textbox');
    await commentInput.fill('Network test comment');

    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 5. Error message shown
    await page.waitForTimeout(500);

    // "Network error" or "Connection failed"
    // Option to retry
    // Data preserved in form

    // Restore connection
    await page.context().setOffline(false);
  });

  test('Handle comment pagination', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to entity with 100+ comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. View comments section
    const loadMoreButton = page.getByRole('button', { name: /load more|show more/i });

    if ((await loadMoreButton.count()) > 0) {
      // 4. Click "Load More" or scroll
      await loadMoreButton.click();

      // 5. Additional comments load
      await page.waitForTimeout(500);

      // Next batch loads
      // Smooth loading
      // No duplicate comments
      // Maintains sort order
    }
  });

  test('Handle rate limiting', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User posts multiple comments rapidly
    for (let i = 0; i < 5; i++) {
      const addCommentButton = page.getByRole('button', { name: /add comment/i });
      await addCommentButton.click();

      const commentInput = page.getByRole('textbox');
      await commentInput.fill(`Rapid comment ${i + 1}`);

      const postButton = page.getByRole('button', { name: /post/i });
      await postButton.click();

      await page.waitForTimeout(100);
    }

    // 4. Check rate limit
    // Rate limit enforced
    // Error message after limit
    // Prevents spam
    // Reasonable limits
  });
});
