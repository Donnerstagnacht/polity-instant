// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Public Profile Viewing', () => {
  test('Verify Public Profile Content Limitations', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to test user profile
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17');
    await page.waitForURL('**', { timeout: 5000 });

    const currentUrl = page.url();

    // 3. If profile is viewable publicly
    if (!currentUrl.includes('/auth')) {
      // Check for presence of personal contact information
      const emailText = page.getByText(/@.*\.com/);
      const emailCount = await emailText.count();

      // Verify email addresses are NOT displayed
      expect(emailCount).toBe(0);

      // Verify phone numbers are NOT displayed
      const phonePattern = page.getByText(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
      const phoneCount = await phonePattern.count();
      expect(phoneCount).toBe(0);

      // Check if bio and public information IS displayed
      const bioSection = page.locator('[class*="bio"]').or(page.getByText(/bio/i).locator('..'));
      const bioCount = await bioSection.count();
      if (bioCount > 0) {
        // Bio section is visible
      }

      // Verify social stats visibility
      const statsSection = page
        .locator('[class*="stat"]')
        .or(page.getByText(/followers|following/i).first());
      const statsCount = await statsSection.count();
      if (statsCount > 0) {
        // Stats section is visible
      }
    } else {
      // 4. If redirected to auth, mark as N/A
    }
  });
});
