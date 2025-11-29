// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { generateTestMagicCode } from 'e2e/helpers/magic-code-helper';

test.describe('OTP Code Verification', () => {
  test('Enter Valid OTP Code and Verify Automatic Authentication', async ({ page }) => {
    // 1. Navigate to /auth/verify (via email entry flow)
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });
    const email = 'tobias.hassebrock@gmail.com';
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('button', { name: 'Send magic code' }).click();

    await expect(page).toHaveURL(/\/auth\/verify/);

    // 2. Generate test magic code using helper function
    const code = await generateTestMagicCode(email);

    // 3. Log the generated code

    // 4. Split code into digits
    const codeDigits = code.split('');

    // 5. Locate all OTP inputs
    const otpInputs = page.getByRole('textbox');

    // 6. For each digit (i from 0 to 5): Fill inputs.nth(i) with codeDigits[i]
    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    // 7. Wait for automatic form submission
    // 8. Wait for URL change to / (home page) with timeout: 10 seconds
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 9. Verify final URL is exactly /
    // 10. Check that authentication succeeded
    await expect(page).toHaveURL('/');
  });
});
