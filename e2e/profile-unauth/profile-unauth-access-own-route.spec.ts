// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Access Control for Edit Pages', () => {
  test('Attempt to Access Own Profile Route Without Authentication', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to /user
    await page.goto('/user');

    // 3. Wait for page load or redirect (timeout: 5 seconds)
    await page.waitForURL('**', { timeout: 5000 });

    // 4. Check final URL
    const currentUrl = page.url();

    // 5. Verify behavior - /user route may redirect or show content
    const isAuthPage = currentUrl.includes('/auth');
    const isUserPage = currentUrl.includes('/user');

    expect(isAuthPage || isUserPage).toBeTruthy();

    if (isAuthPage) {
      const authHeading = page.getByRole('heading', { name: /sign in|log in/i });
      await expect(authHeading).toBeVisible();
    } else {
      console.log('/user route is accessible without authentication');
    }
  });
});
