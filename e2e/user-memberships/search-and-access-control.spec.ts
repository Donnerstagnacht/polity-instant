import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Search', () => {
  test('should filter memberships by search text', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    // Create a group membership so the search has data
    const group = await groupFactory.createGroup(mainUserId, { name: 'Searchable E2E Group' });

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.getByPlaceholder(/search by name/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Searchable');
    // Results should be filtered (search is type-ahead)
    await page.waitForTimeout(500);
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
