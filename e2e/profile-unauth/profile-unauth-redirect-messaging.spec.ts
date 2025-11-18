// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Error Handling and User Feedback', () => {
  test('Verify Authentication Redirect Messaging', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to protected edit page
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit');
    await page.waitForURL('**', { timeout: 5000 });

    // 3. After redirect to /auth, check for clear heading
    const heading = page.getByRole('heading', { name: /sign in|log in|authenticate/i });
    await expect(heading).toBeVisible();

    // Get heading text for verification
    const headingText = await heading.textContent();

    // Verify user-friendly messaging (not technical errors)
    expect(headingText).toBeTruthy();
    expect(headingText?.toLowerCase()).not.toContain('error');
    expect(headingText?.toLowerCase()).not.toContain('500');
    expect(headingText?.toLowerCase()).not.toContain('404');

    // Verify no error codes or stack traces visible
    const errorTrace = page.getByText(/stack trace|at \w+\.\w+|line \d+/i);
    const errorCount = await errorTrace.count();
    expect(errorCount).toBe(0);

    // 4. Verify page provides path forward (login form)
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
  });
});
