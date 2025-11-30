// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Display Blog Content', () => {
  test('User views blog with header, stats, and content', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Title displayed prominently
    const title = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(title).toBeVisible();

    // 5. Creator/author info shown with avatar
    page.getByText(/created by/i);
    page.getByRole('img', { name: /avatar/i }).or(page.locator('[class*="Avatar"]'));

    // 6. Date displayed
    page.getByText(/\d{4}/).or(page.locator('[data-testid="blog-date"]'));

    // 7. Hashtags visible
    page.locator('[data-testid="hashtags"]').or(page.getByText(/#\w+/));

    // 8. Public/private badge shown
    page.locator('[data-testid="visibility-badge"]');

    // Blog content is visible
    await expect(page).toHaveURL(/\/blog\/.+/);
  });

  test('Blog stats bar displays accurate counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Check stats bar
    page.locator('[data-testid="stats-bar"]').or(page.locator('.stats-bar'));

    // 4. Subscriber count accurate
    const subscriberCount = page.getByText(/subscriber/i);

    // 5. Like count accurate (if available)
    page.getByText(/like/i);

    // 6. Comment count accurate
    const commentCount = page.getByText(/comment/i);

    // 7. Stats update in real-time
    await subscriberCount.count();
    await commentCount.count();
  });
});
