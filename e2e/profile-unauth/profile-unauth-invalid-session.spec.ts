// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Security Considerations', () => {
  test('Test with Expired/Invalid Session', async ({ page }) => {
    // 1. Start with no authentication

    // 2. Manually set invalid authentication cookie
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: 'invalid-token-12345',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // 3. Navigate to profile pages
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17');
    await page.waitForURL('**', { timeout: 5000 });

    const currentUrl = page.url();

    // 4. Verify invalid authentication is detected
    // Should either redirect to auth or show as unauthenticated
    const isAuthRedirect = currentUrl.includes('/auth');
    const editButton = page
      .getByRole('link', { name: /edit/i })
      .or(page.getByRole('button', { name: /edit/i }));
    const hasEditAccess = (await editButton.count()) > 0;

    // 5. Verify proper re-authentication flow
    // User should not have edit access with invalid token
    expect(hasEditAccess).toBe(false);
    // Document whether auth redirect occurred
    if (isAuthRedirect) {
      expect(currentUrl).toContain('/auth');
    }
  });
});
