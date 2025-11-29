// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { generateTestMagicCode } from '../helpers/magic-code-helper';

test.describe('Complete Authentication Flow End-to-End', () => {
  test('Full Magic Link Authentication Flow', async ({ page }) => {
    const email = 'tobias.hassebrock@gmail.com';

    // 1. Start at home page / (unauthenticated)
    await page.goto('/');

    // 2. Navigate to /auth
    await page.goto('/auth');

    // 3. Wait for page load
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });

    // 4. Enter email: tobias.hassebrock@gmail.com
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);

    // 5. Click "Send code" button
    await page.getByRole('button', { name: 'Send magic code' }).click();

    // 6. Wait for navigation to /auth/verify
    await expect(page).toHaveURL(/\/auth\/verify/);

    // 7. Generate magic code
    const code = await generateTestMagicCode(email);

    // 8. Split code into digits
    const codeDigits = code.split('');

    // 9. Fill all 6 OTP input fields
    const otpInputs = page.getByRole('textbox');
    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    // 10. Wait for auto-submission and redirect
    // 11. Verify final URL is /
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 12. Verify authentication successful
    await expect(page).toHaveURL('/');
  });
});
