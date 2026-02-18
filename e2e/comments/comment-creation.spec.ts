// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Comments - Create Basic Comment', () => {
  test('Create top-level comment', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Comment Blog ${Date.now()}` });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Click "Add Comment" button
    const addCommentButton = page.getByRole('button', { name: 'Add Comment' });
    await addCommentButton.click();

    // 4. Enter comment text
    const commentInput = page.getByPlaceholder('Write your comment...');
    await commentInput.fill('Great insights on this topic!');

    // 5. Click "Post Comment"
    const postButton = page.getByRole('button', { name: /post comment|post|submit/i });
    await postButton.click();

    // 6. Comment created

    // Comment appears in list
    await expect(page.locator('p').filter({ hasText: 'Great insights on this topic!' })).toBeVisible({ timeout: 3000 });

    // Creator info saved
    // Timestamp recorded
  });

  test('Create comment with long text', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Long Comment Blog ${Date.now()}` });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Add comment
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    // 4. Enter multiple paragraphs
    const longText = `This is a very long comment that spans multiple paragraphs.

It contains several points and arguments that need to be expressed in detail.

The formatting should be preserved when the comment is posted and displayed.`;

    const commentInput = page.getByPlaceholder('Write your comment...');
    await commentInput.fill(longText);

    // 5. Post
    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 6. Full text saved

    // Formatting preserved
    // Displays correctly
    await expect(page.locator('p').filter({ hasText: /This is a very long comment/i })).toBeVisible({ timeout: 3000 });
  });

  test('Create comment with special characters', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Special Comment Blog ${Date.now()}` });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Add comment with emojis, unicode
    const addCommentButton = page.getByRole('button', { name: /add comment/i });
    await addCommentButton.click();

    const specialText = 'Great work! 👍 This is très intéressant 🎉 #awesome';

    const commentInput = page.getByPlaceholder('Write your comment...');
    await commentInput.fill(specialText);

    // 4. Post
    const postButton = page.getByRole('button', { name: /post/i });
    await postButton.click();

    // 5. All characters preserved

    // Displayed correctly
    // No encoding issues
    await expect(page.locator('p').filter({ hasText: /Great work!/i })).toBeVisible({ timeout: 3000 });
  });
});
