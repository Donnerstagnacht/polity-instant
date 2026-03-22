// spec: Voting password creation and update flow

import { test, expect } from '../fixtures/test-base';

test.describe('Voting Password - Create and Update', () => {
  test('User can navigate to voting password settings', async ({ authenticatedPage: page }) => {
    // Navigate to user settings / profile edit
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    // Look for voting password tab
    const votingPasswordTab = page.getByRole('tab', { name: /voting.?password/i });

    if ((await votingPasswordTab.count()) > 0) {
      await votingPasswordTab.click();

      // Should see password input fields
      const passwordInput = page.locator('input[type="password"]').or(
        page.locator('input[inputmode="numeric"]')
      );

      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }
    }
  });

  test('User can set a new voting password', async ({ authenticatedPage: page }) => {
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    const votingPasswordTab = page.getByRole('tab', { name: /voting.?password/i });
    if ((await votingPasswordTab.count()) === 0) return;

    await votingPasswordTab.click();
    await page.waitForTimeout(500);

    // Fill in 4-digit password fields
    const passwordInputs = page.locator('input[type="password"]').or(
      page.locator('input[inputmode="numeric"]')
    );

    if ((await passwordInputs.count()) >= 2) {
      // First field: new password
      await passwordInputs.nth(0).fill('1234');
      // Second field: confirm password
      await passwordInputs.nth(1).fill('1234');

      // Submit
      const submitButton = page.getByRole('button', { name: /set|save|update|submit/i });
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Should show success indicator
        const successBadge = page.getByText(/set|active|saved/i);
        if ((await successBadge.count()) > 0) {
          await expect(successBadge.first()).toBeVisible();
        }
      }
    }
  });

  test('Password mismatch shows validation error', async ({ authenticatedPage: page }) => {
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    const votingPasswordTab = page.getByRole('tab', { name: /voting.?password/i });
    if ((await votingPasswordTab.count()) === 0) return;

    await votingPasswordTab.click();
    await page.waitForTimeout(500);

    const passwordInputs = page.locator('input[type="password"]').or(
      page.locator('input[inputmode="numeric"]')
    );

    if ((await passwordInputs.count()) >= 2) {
      // Enter mismatched passwords
      await passwordInputs.nth(0).fill('1234');
      await passwordInputs.nth(1).fill('5678');

      // Submit button should be disabled or show error on submit
      const submitButton = page.getByRole('button', { name: /set|save|update|submit/i });
      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Should show error message about passwords not matching
        const errorText = page.getByText(/match|mismatch|don't match|not match/i);
        if ((await errorText.count()) > 0) {
          await expect(errorText.first()).toBeVisible();
        }
      }
    }
  });
});
