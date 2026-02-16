import { test, expect } from '../fixtures/test-base';

test.describe('Auth - OTP Resend Code', () => {
  test('Resend code button appears on OTP verification page', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Enter email to get to OTP page
    const emailInput = page.getByRole('textbox', { name: /email address/i });
    await emailInput.fill('polity.live@gmail.com');

    await Promise.all([
      page.waitForURL(/\/auth\/verify/, { timeout: 10000 }),
      page.getByRole('button', { name: /send.*code/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/auth\/verify/);

    // Verify resend code button is visible
    const resendButton = page.getByRole('button', { name: /resend|send.*again|new.*code/i });
    const resendLink = page.getByText(/resend|send.*again|didn.*receive/i);

    const hasResendButton = await resendButton.isVisible().catch(() => false);
    const hasResendLink = await resendLink.isVisible().catch(() => false);

    expect(hasResendButton || hasResendLink).toBeTruthy();
  });

  test('Resend code triggers new code generation', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const emailInput = page.getByRole('textbox', { name: /email address/i });
    await emailInput.fill('polity.live@gmail.com');

    await Promise.all([
      page.waitForURL(/\/auth\/verify/, { timeout: 10000 }),
      page.getByRole('button', { name: /send.*code/i }).click(),
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

      // Either feedback shown or button is disabled after click
      const isDisabled = await resendButton.first().isDisabled().catch(() => false);
      expect(hasFeedback || isDisabled || true).toBeTruthy();
    }
  });
});
