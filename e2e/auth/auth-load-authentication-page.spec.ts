// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Entry and Magic Code Request', () => {
  test('Load Authentication Page', async ({ page }) => {
    // 1. Navigate to /auth
    await page.goto('/auth');

    // 2. Wait for network to be idle
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });

    // 3. Verify heading containing "sign in to polity" is visible
    await expect(page.getByRole('heading', { name: 'Sign in to Polity' })).toBeVisible();

    // 4. Verify email input field exists
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();

    // 5. Verify "Send code" button is present
    const sendButton = page.getByRole('button', { name: 'Send magic code' });
    await expect(sendButton).toBeVisible();

    // 6. Check initial button state (should be disabled until valid email entered)
    await expect(sendButton).toBeDisabled();
  });
});
