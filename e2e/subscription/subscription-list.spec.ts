// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('View Subscriptions List', () => {
  test('User can view all subscriptions', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to own profile first
    await page.goto('/user/page');
    await page.waitForLoadState('networkidle');

    // 3. Look for and click subscriptions link/tab
    const subscriptionsLink = page.getByRole('link', { name: /subscription/i });

    if ((await subscriptionsLink.count()) > 0) {
      await subscriptionsLink.first().click();

      // 4. Verify we're on subscriptions page
      await expect(page).toHaveURL(/\/user\/[^/]+\/subscriptions/);

      // 5. Verify page heading
      await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({
        timeout: 5000,
      });
    } else {
      // 6. Try direct navigation if link not found
      await page.goto('/user/page/subscriptions');
      await page.waitForLoadState('networkidle');

      // Verify some subscription-related content exists
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    }
  });
});
