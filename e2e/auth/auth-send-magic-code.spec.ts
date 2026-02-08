// spec: e2e/test-plans/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Entry and Magic Code Request', () => {
  test('Send Magic Code Successfully', async ({ page }) => {
    // 1. Navigate to /auth and wait for load
    await page.goto('/auth');

    // 2. Verify heading "Sign in to Polity" is visible
    await expect(page.getByRole('heading', { name: 'Sign in to Polity' })).toBeVisible();

    // 3. Fill email input with polity.live@gmail.com
    await page.getByRole('textbox', { name: 'Email address' }).fill('polity.live@gmail.com');

    // 4. Click "Send code" button
    await page.getByRole('button', { name: 'Send magic code' }).click();

    // 5. Wait for navigation to /auth/verify (timeout: 10 seconds)
    // 6. Verify URL contains /auth/verify
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 10000 });

    // 7. Verify heading on verify page is visible
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible();
  });
});
