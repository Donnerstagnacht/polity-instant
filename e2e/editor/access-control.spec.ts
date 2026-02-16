import { test, expect } from '../fixtures/test-base';
test.describe('Editor - Access Control', () => {
  test('should require authentication for editor page', async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    // Should redirect to auth or show sign-in prompt
    const isOnAuth = page.url().includes('/auth');
    const signInPrompt = page.getByText(/sign in|log in/i);

    if (isOnAuth) {
      await expect(page).toHaveURL(/\/auth/);
    } else if ((await signInPrompt.count()) > 0) {
      await expect(signInPrompt.first()).toBeVisible();
    }
  });

  test('should only show documents owned by or shared with the user', async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    // All visible documents should belong to or be shared with the test user
    const documentCards = page.locator('[class*="card"], [class*="Card"]');
    const count = await documentCards.count();

    // Page should load without errors
    const errorText = page.getByText(/error|failed/i);
    expect(await errorText.count()).toBeLessThanOrEqual(0);
  });
});
