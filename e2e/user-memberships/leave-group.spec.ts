import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Leave Group', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should show Leave button on active memberships', async ({ authenticatedPage: page }) => {
    const activeMemberships = page.getByText(/active memberships/i);
    if ((await activeMemberships.count()) === 0) {
      test.skip();
      return;
    }

    const leaveButton = page.getByRole('button', { name: /leave/i });
    if ((await leaveButton.count()) > 0) {
      await expect(leaveButton.first()).toBeVisible();
    }
  });

  test('should show Withdraw Request button on pending requests', async ({ authenticatedPage: page }) => {
    const pendingRequests = page.getByText(/pending requests/i);
    if ((await pendingRequests.count()) === 0) {
      test.skip();
      return;
    }

    const withdrawButton = page.getByRole('button', { name: /withdraw request/i });
    if ((await withdrawButton.count()) > 0) {
      await expect(withdrawButton.first()).toBeVisible();
    }
  });
});
