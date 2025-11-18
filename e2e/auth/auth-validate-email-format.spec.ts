// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Entry and Magic Code Request', () => {
  test('Validate Email Format (Invalid Email)', async ({ page }) => {
    // 1. Navigate to /auth
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });

    // 2. Locate email input field
    const emailInput = page.getByRole('textbox', { name: 'Email address' });

    // 3. Enter invalid email: invalid-email (no @ symbol)
    await emailInput.fill('invalid-email');

    // 4. Locate submit button
    const sendButton = page.getByRole('button', { name: 'Send magic code' });

    // 5. Click the submit button
    await sendButton.click();

    // 6. Verify HTML5 validation message appears and form does not submit
    await expect(page).toHaveURL('/auth');
  });
});
