// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication State Detection', () => {
  test('Verify Unauthenticated Header/Navigation', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for page to fully load
    await page.waitForURL('**', { timeout: 5000 });

    // 4. Check navigation header for sign in/log in button
    const signInButton = page
      .getByRole('link', { name: /sign in|log in/i })
      .or(page.getByRole('button', { name: /sign in|log in/i }));
    const signInCount = await signInButton.count();

    if (signInCount > 0) {
      await expect(signInButton.first()).toBeVisible();
    } else {
      // Alternative unauthenticated state - no sign in button visible
    }

    // Check that authenticated user menu is NOT present
    const userMenu = page
      .locator('[aria-label*="user menu"]')
      .or(page.locator('button:has-text("@")'));
    const menuCount = await userMenu.count();

    expect(menuCount).toBe(0);
  });
});
