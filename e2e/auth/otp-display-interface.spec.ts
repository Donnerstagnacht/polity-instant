// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('OTP Code Verification', () => {
  test('Display OTP Input Interface', async ({ page }) => {
    // 1. Navigate through email entry
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: 'Email address' }).fill('polity.live@gmail.com');
    await page.getByRole('button', { name: 'Send magic code' }).click();

    // 2. Wait for /auth/verify page to load
    await expect(page).toHaveURL(/\/auth\/verify/);

    // 3. Verify heading contains "enter" and "code" OR "verify"
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible();

    // 4. Locate all OTP input fields
    const otpInputs = page
      .locator('input[type="text"]')
      .filter({ hasNot: page.locator('[name="email"]') });

    // 5. Count the number of input fields
    // 6. Verify exactly 6 input fields are present
    await expect(otpInputs).toHaveCount(6);

    // 7. Check that first input field is focused
    await expect(otpInputs.first()).toBeFocused();
  });
});
