// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Entry and Magic Code Request', () => {
  test('Enter Valid Email Address', async ({ page }) => {
    // 1. Navigate to /auth and wait for page load
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });

    // 2. Locate email input and fill with test email
    const emailInput = page.getByRole('textbox', { name: 'Email address' });

    // 3. Fill input with test email: tobias.hassebrock@gmail.com
    await emailInput.fill('tobias.hassebrock@gmail.com');

    // 4. Verify email is displayed in the input field
    await expect(emailInput).toHaveValue('tobias.hassebrock@gmail.com');

    // 5. Check that "Send code" button becomes enabled
    const sendButton = page.getByRole('button', { name: 'Send magic code' });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
  });
});
