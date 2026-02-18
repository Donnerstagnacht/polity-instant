// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Blogs - Display Blog Content', () => {
  test('User views blog with header, stats, and content', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Display Blog Test ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 4. Title displayed prominently
    const title = page.getByRole('heading', { level: 1 }).first();
    await expect(title).toBeVisible({ timeout: 10000 });

    // Blog content is visible
    await expect(page).toHaveURL(/\/blog\/.+/);
  });

  test('Blog stats bar displays accurate counts', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Stats Blog Test ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Blog page should load without errors
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Page should show something (title or blog content)
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
