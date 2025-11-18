// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('OTP Code Verification', () => {
  test('Test Invalid OTP Code', async ({ page }) => {
    // 1. Navigate to /auth/verify via email flow
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: 'Email address' }).fill('tobias.hassebrock@gmail.com');
    await page.getByRole('button', { name: 'Send magic code' }).click();

    await expect(page).toHaveURL(/\/auth\/verify/);

    // 2. DO NOT generate valid code
    // 3. Enter invalid 6-digit code: 999999
    const otpInputs = page.getByRole('textbox');
    const invalidCode = '999999';
    const codeDigits = invalidCode.split('');

    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    // 4. Wait for form submission attempt
    await page.waitForTimeout(2000);

    // 7. Verify user remains on /auth/verify page (invalid code rejected)
    await expect(page).toHaveURL(/\/auth\/verify/);
  });
});
