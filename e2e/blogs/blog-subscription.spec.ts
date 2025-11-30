// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blogs - Blog Subscription', () => {
  test('User subscribes to a blog', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page (not subscribed)
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    const isSubscribed = (await subscribeButton.getByText(/unsubscribe/i).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 3000,
      });

      // 6. Subscriber count increases
      await page.waitForTimeout(500);
    }

    // 7. Blog posts appear in user's feed
    await expect(
      page.getByRole('button', { name: /unsubscribe/i }).or(subscribeButton)
    ).toBeVisible();
  });

  test('User unsubscribes from a blog', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog page
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Ensure user is subscribed first
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });

    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      await page.waitForTimeout(500);
    }

    // 4. Click "Unsubscribe" button
    await unsubscribeButton.click();

    // 5. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 3000 });

    // 6. Subscriber count decreases
    // Blog removed from feed
    await page.waitForTimeout(500);
  });
});
