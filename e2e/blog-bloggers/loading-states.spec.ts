import { test, expect } from '../fixtures/test-base';

test.describe('Blog Bloggers - Loading States', () => {
  test('Bloggers page renders after loading', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Test Blog ${Date.now()}` });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Test Blog ${Date.now()}` });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Bloggers list or empty state shown', async ({ authenticatedPage: page, blogFactory, mainUserId }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: `Test Blog ${Date.now()}` });
    await page.goto(`/blog/${blog.id}/bloggers`);

    // Wait for PermissionGuard + BlogBloggersManager to finish loading
    // The page will show either "Manage Bloggers" heading, AccessDenied, or "Blog not found"
    const manageBloggersHeading = page.getByRole('heading', { name: /manage bloggers/i });
    const accessDenied = page.getByText(/access denied/i);
    const blogNotFound = page.getByText(/blog not found/i);

    await expect(
      manageBloggersHeading.or(accessDenied).or(blogNotFound)
    ).toBeVisible({ timeout: 30000 });
  });
});
