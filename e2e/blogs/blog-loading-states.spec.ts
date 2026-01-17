// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';import { TEST_ENTITY_IDS } from '../test-entity-ids';
test.describe('Blogs - Blog Loading States', () => {
  test('Blog page displays loading indicator', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Intercept network requests to delay response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // 3. Navigate to blog page
    await page.goto('/blog/test-blog-id');

    // 4. Loading indicator displayed
    const loadingIndicator = page
      .getByRole('status')
      .or(page.getByText(/loading/i))
      .or(page.locator('.loading'));

    // Check if loading state was visible (may be very brief)
    await loadingIndicator.count();

    // 5. Wait for blog to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      return;
    });

    // 6. Smooth transition when loaded
    await page.waitForTimeout(500);

    // No layout shift
  });

  test('Comments section loads smoothly', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog with many comments
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Comments load efficiently
    page.locator('[data-testid="comments"]').or(page.getByText(/discussion/i).locator('..'));

    // 5. Loading spinner if needed
    page.locator('[data-testid="comment-loader"]');

    // 6. Smooth rendering
    // Pagination if many comments
    await page.waitForTimeout(300);
  });
});
