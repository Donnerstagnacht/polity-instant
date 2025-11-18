// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Public Profile Viewing', () => {
  test('Attempt to View User Profile Without Authentication', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to known test user
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17');

    // 3. Wait for page to fully load (timeout: 5 seconds)
    await page.waitForURL('**', { timeout: 5000 });

    // 4. Check current URL
    const currentUrl = page.url();

    // 5. Determine which scenario occurs
    const isAuthPage = currentUrl.includes('/auth');
    const isProfilePage = currentUrl.includes('/user/');

    // 6. For Scenario A: URL contains /auth
    if (isAuthPage) {
      // Verify heading contains "sign in" text
      const authHeading = page.getByRole('heading', { name: /sign in/i });
      await expect(authHeading).toBeVisible();

      // Verify authentication form is visible
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible();
    }

    // 7. For Scenario B: URL still on /user/...
    if (isProfilePage && !isAuthPage) {
      // Verify profile heading is visible
      const heading = page.locator('h1, h2, h3').first();
      await expect(heading).toBeVisible();

      // Verify profile content loads
      await expect(heading).not.toBeEmpty();

      // Check edit link presence
      const editLink = page.locator('a[href*="/edit"]');
      const editCount = await editLink.count();

      console.log(`Edit link ${editCount > 0 ? 'is' : 'is not'} present`);
    }
  });
});
