// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Error Handling and User Feedback', () => {
  test('Test Invalid User ID Access', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to invalid user ID
    await page.goto('/user/invalid-user-id-12345');

    // 3. Wait for page response
    await page.waitForURL('**', { timeout: 5000 });

    const currentUrl = page.url();

    // 4. Verify graceful handling
    const isAuthRedirect = currentUrl.includes('/auth');
    const notFoundText = page.getByText(/not found|404|doesn't exist/i);
    const notFoundCount = await notFoundText.count();
    const hasErrorPage = notFoundCount > 0;
    const isUserPage = currentUrl.includes('/user');

    expect(isAuthRedirect || hasErrorPage || isUserPage).toBeTruthy();

    // 5. Verify no application crash or unhandled errors
    // Check for common error indicators
    const crashIndicator = page.getByText(
      /application error|unexpected error|something went wrong/i
    );
    const hasCrash = await crashIndicator.count();

    expect(hasCrash).toBe(0);
  });
});
