// spec: e2e/auth/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { generateTestMagicCode } from '../helpers/magic-code-helper';

test.describe('Returning User Authentication', () => {
  test('Returning user login - no onboarding shown', async ({ page }) => {
    // Use polity.live@gmail.com which is an existing user with onboarding completed
    const email = 'polity.live@gmail.com';

    // 1. Start at home page / (unauthenticated)
    await page.goto('/');

    // 2. Navigate to /auth
    await page.goto('/auth');

    // 3. Wait for page load
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });

    // 4. Enter email
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);

    // 5. Click "Send magic code" button
    await page.getByRole('button', { name: 'Send magic code' }).click();

    // 6. Wait for navigation to /auth/verify
    await expect(page).toHaveURL(/\/auth\/verify/);

    // 7. Generate magic code
    const code = await generateTestMagicCode(email);

    // 8. Split code into digits and fill OTP inputs
    const codeDigits = code.split('');
    const otpInputs = page.getByRole('textbox');
    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    // 9. Wait for auto-submission and redirect
    // For returning users, should go directly to / without onboarding
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 10. Close Aria & Kai welcome dialog if it appears
    try {
      const closeButton = page.getByRole('button', { name: /close/i }).last();
      await closeButton.waitFor({ state: 'visible', timeout: 2000 });
      await closeButton.click();
    } catch {
      // Dialog not present or already closed
    }

    // 11. Verify authentication successful - should see authenticated content (not onboarding)
    // Check that we're on home page and NOT in onboarding
    await expect(page.getByText(/What's your name/i)).not.toBeVisible();
    
    // Verify authenticated - check for user initials button or timeline heading
    await expect(page.getByRole('heading', { name: /Your Political Ecosystem/i })).toBeVisible({ timeout: 5000 });
  });

  test('Returning user remains authenticated after page refresh', async ({ page }) => {
    const email = 'polity.live@gmail.com';

    // Complete authentication
    await page.goto('/auth');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('button', { name: 'Send magic code' }).click();
    await expect(page).toHaveURL(/\/auth\/verify/);

    const code = await generateTestMagicCode(email);
    const codeDigits = code.split('');
    const otpInputs = page.getByRole('textbox');
    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Refresh the page
    await page.reload();

    // Verify user remains authenticated (should not redirect to /auth)
    await expect(page).toHaveURL('/');
    
    // Should see authenticated user elements, not login page
    await expect(page.getByText('Sign in to Polity')).not.toBeVisible();
  });
});
