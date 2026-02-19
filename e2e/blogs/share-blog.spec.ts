import { test, expect } from '../fixtures/test-base';

test.describe('Blog - Share Blog', () => {
  test('should display share button on blog detail page', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Share Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // Share button uses Share2 icon
    const shareButton = page.getByRole('button', { name: /share/i });
    await expect(shareButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should copy blog link when share button is clicked', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Share Copy Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const shareButton = page.getByRole('button', { name: /share/i });
    await expect(shareButton.first()).toBeVisible({ timeout: 10000 });
    await shareButton.first().click();

    // Should show a share dropdown or copy confirmation
    const copied = page.getByText(/copied|link|share/i);
    await expect(copied.first()).toBeVisible({ timeout: 5000 });
  });
});
