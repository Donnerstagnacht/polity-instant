// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Access Control for Edit Pages', () => {
  test('Verify No Edit Button on Public Profile (If Accessible)', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to test user profile
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17');
    await page.waitForURL('**', { timeout: 5000 });

    const currentUrl = page.url();

    // 3. If profile page loads (public profiles enabled)
    if (!currentUrl.includes('/auth')) {
      // Look for edit button using link role
      const editLink = page.getByRole('link', { name: /edit/i });
      const editLinkCount = await editLink.count();

      // Look for edit button using button role
      const editButton = page.getByRole('button', { name: /edit/i });
      const editButtonCount = await editButton.count();

      // Verify edit button is NOT present
      expect(editLinkCount).toBe(0);
      expect(editButtonCount).toBe(0);
    } else {
      // 4. If redirected to auth page, skip edit button check
      console.log('Redirected to auth page - edit button check skipped');
    }
  });
});
