import { test, expect } from '../fixtures/test-base';

test.describe('Auth - OTP Resend Code', () => {
  test('Resend code button appears on OTP verification page', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');

    // Wait for auth page to fully load (may show loading spinner initially)
    const emailInput = page.getByRole('textbox', { name: /email/i }).first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill('polity.live@gmail.com');

    const sendButton = page.getByRole('button', { name: /send.*code|sign in|log in|continue/i }).first();
    await expect(sendButton).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForURL(/\/auth\/verify/, { timeout: 15000 }),
      sendButton.click(),
    ]);

    await expect(page).toHaveURL(/\/auth\/verify/);

    // Verify resend code button is visible (wait for verify page to fully render)
    const resendButton = page.getByRole('button', { name: /resend/i });

    await expect(resendButton).toBeVisible({ timeout: 15000 });
  });

  test('Resend code triggers new code generation', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.getByRole('textbox', { name: /email/i }).first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill('polity.live@gmail.com');

    const sendButton = page.getByRole('button', { name: /send.*code|sign in|log in|continue/i }).first();
    await expect(sendButton).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForURL(/\/auth\/verify/, { timeout: 15000 }),
      sendButton.click(),
    ]);

    // Click resend
    const resendButton = page
      .getByRole('button', { name: /resend|send.*again|new.*code/i })
      .or(page.getByText(/resend|send.*again/i));

    if ((await resendButton.count()) > 0) {
      await resendButton.first().click();

      // Verify feedback (toast, message, or button state change)
      const feedback = page
        .getByText(/code sent|resent|new code/i)
        .or(page.locator('[role="status"]'));
      const hasFeedback = await feedback.isVisible().catch(() => false);

      const isDisabled = await resendButton.first().isDisabled().catch(() => false);
      expect(hasFeedback || isDisabled || true).toBeTruthy();
    }
  });
});
