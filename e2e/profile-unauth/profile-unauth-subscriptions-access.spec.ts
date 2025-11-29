// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Navigation Behavior While Unauthenticated', () => {
  test('Access Subscriptions Page Without Authentication', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate directly to subscriptions page
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17/subscriptions');

    // 3. Wait for page load or redirect (timeout: 5 seconds)
    await page.waitForURL('**', { timeout: 5000 });

    // 4. Verify current URL
    const currentUrl = page.url();

    // 5. Check if redirected to auth or page is accessible
    const isAuthPage = currentUrl.includes('/auth');
    const isSubscriptionsPage = currentUrl.includes('/subscriptions');

    expect(isAuthPage || isSubscriptionsPage).toBeTruthy();

    if (isAuthPage) {
      const authHeading = page.getByRole('heading', { name: /sign in|log in/i });
      await expect(authHeading).toBeVisible();
    } else {
      // Subscriptions page is accessible
      expect(isSubscriptionsPage).toBeTruthy();
    }
  });
});
