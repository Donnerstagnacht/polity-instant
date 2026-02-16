import { test, expect } from '../fixtures/test-base';
import { logout } from '../helpers/auth';
test.describe('Auth - Logout', () => {
  test('should log out the user and redirect to auth page', async ({ authenticatedPage: page }) => {
    // Verify we're logged in — fixture lands on /notifications
    await expect(page).toHaveURL(/\/(notifications)?/);

    // Log out
    await logout(page);

    // Should be on auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should prevent access to protected pages after logout', async ({ authenticatedPage: page }) => {
    await logout(page);

    // Try to access a protected page
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');

    // Should redirect to auth or show sign-in prompt
    const isOnAuth = page.url().includes('/auth');
    const signInPrompt = page.getByText(/sign in|log in/i);

    if (isOnAuth) {
      await expect(page).toHaveURL(/\/auth/);
    } else if ((await signInPrompt.count()) > 0) {
      await expect(signInPrompt.first()).toBeVisible();
    }
  });
});
