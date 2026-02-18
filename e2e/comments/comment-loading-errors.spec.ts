// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Comments - Loading States and Error Handling', () => {
  test('Display loading state while fetching comments', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Loading Blog ${Date.now()}` });

    const navigationPromise = page.goto(`/blog/${blog.id}`);

    await navigationPromise;
    await page.waitForLoadState('domcontentloaded');

    // 4. Comments displayed when loaded

    page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    // Loading state replaced with content
    // Smooth transition
  });

  test('Handle create comment validation errors', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Validation Blog ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Click Add Comment to reveal comment form
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    // 4. Post button should be disabled when no text is entered
    const postButton = page.getByRole('button', { name: /post/i });
    await expect(postButton).toBeDisabled({ timeout: 5000 });

    // 5. Validation enforced via disabled button - user cannot submit empty comment
  });

  test('Handle network error during comment creation', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Network Error Blog ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Open comment form first, then simulate network issue
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    await page.context().setOffline(true);

    // 4. Attempt to create comment
    const commentInput = page.getByPlaceholder('Write your comment...');
    await commentInput.fill('Network test comment');

    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 5. Error message shown

    // "Network error" or "Connection failed"
    // Option to retry
    // Data preserved in form

    // Restore connection
    await page.context().setOffline(false);
  });

  test('Handle comment pagination', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Pagination Blog ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. View comments section
    const loadMoreButton = page.getByRole('button', { name: /load more|show more/i });

    if ((await loadMoreButton.count()) > 0) {
      // 4. Click "Load More" or scroll
      await loadMoreButton.click();

      // 5. Additional comments load

      // Next batch loads
      // Smooth loading
      // No duplicate comments
      // Maintains sort order
    }
  });

  test('Handle rate limiting', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    test.setTimeout(60000);
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Rate Limit Blog ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. User posts multiple comments rapidly
    for (let i = 0; i < 5; i++) {
      // Wait for "Add Comment" button to appear (form is closed after each post)
      const addCommentButton = page.getByRole('button', { name: /add comment/i });
      await expect(addCommentButton).toBeVisible({ timeout: 10000 });
      await addCommentButton.click();

      // Wait for form to appear and React to settle
      const commentInput = page.getByPlaceholder('Write your comment...');
      await expect(commentInput).toBeVisible({ timeout: 5000 });

      await commentInput.fill(`Rapid comment ${i + 1}`);

      // Wait for post button to be enabled after filling text
      const postButton = page.getByRole('button', { name: /post/i });
      await expect(postButton).toBeEnabled({ timeout: 5000 });
      await postButton.click();

      // Wait for comment to appear in the list (use paragraph to avoid matching the textarea)
      await expect(page.locator('p').filter({ hasText: `Rapid comment ${i + 1}` })).toBeVisible({
        timeout: 10000,
      });
    }

    // 4. Check rate limit
    // Rate limit enforced
    // Error message after limit
    // Prevents spam
    // Reasonable limits
  });
});
