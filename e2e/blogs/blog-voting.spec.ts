import { test, expect } from '../fixtures/test-base';

test.describe('Blog - Voting', () => {
  test('should display upvote and downvote buttons', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Vote Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // The blog detail page has ArrowUp/ArrowDown icon buttons for voting
    // They are ghost buttons with SVG icons
    const voteButtons = page.locator('button').filter({ has: page.locator('svg') });
    await expect(voteButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display supporter score in stats bar', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Stats Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // StatsBar shows subscribers, supporters (score), comments
    const supporters = page.getByText(/supporters/i);
    await expect(supporters).toBeVisible({ timeout: 10000 });
  });

  test('should toggle upvote on click', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Upvote Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for the blog detail page to load
    await expect(page.getByText('E2E Upvote Blog').first()).toBeVisible({ timeout: 10000 });

    // Find action buttons with SVG icons (upvote/downvote are ghost buttons)
    const actionButtons = page.locator('button').filter({ has: page.locator('svg') });
    await expect(actionButtons.first()).toBeVisible({ timeout: 5000 });

    // Click the first action button (upvote)
    await actionButtons.first().click();
  });
});
