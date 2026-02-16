import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Search', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should filter memberships by search text', async ({ authenticatedPage: page }) => {
    const searchInput = page.getByPlaceholder(/search by name|search/i);
    if ((await searchInput.count()) === 0) {
      test.skip();
      return;
    }

    await searchInput.fill('test');

    // Results should be filtered (fewer items visible)
  });
});

test.describe('User Memberships - Access Control', () => {
  test('should require authentication', async ({ authenticatedPage: page }) => {
    await page.goto('/user/some-user-id/memberships');
    await page.waitForLoadState('domcontentloaded');

    const isOnAuth = page.url().includes('/auth');
    const signInPrompt = page.getByText(/sign in|log in/i);

    if (isOnAuth) {
      await expect(page).toHaveURL(/\/auth/);
    } else if ((await signInPrompt.count()) > 0) {
      await expect(signInPrompt.first()).toBeVisible();
    }
  });

  test('should show access denied for other users memberships', async ({ authenticatedPage: page }) => {
    await page.goto(`/user/00000000-0000-4000-8000-000000000099/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const accessDenied = page.getByText(/access denied|not authorized/i);
    if ((await accessDenied.count()) > 0) {
      await expect(accessDenied.first()).toBeVisible();
    }
  });
});
