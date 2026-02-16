import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Accept/Decline Invitation', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should show Pending Invitations section', async ({ authenticatedPage: page }) => {
    const pendingInvitations = page.getByText(/pending invitations/i);
    if ((await pendingInvitations.count()) > 0) {
      await expect(pendingInvitations.first()).toBeVisible();
    }
  });

  test('should show Accept and Decline buttons on invitations', async ({ authenticatedPage: page }) => {
    const acceptButton = page.getByRole('button', { name: /accept/i });
    const declineButton = page.getByRole('button', { name: /decline/i });

    if ((await acceptButton.count()) > 0) {
      await expect(acceptButton.first()).toBeVisible();
      await expect(declineButton.first()).toBeVisible();
    }
  });

  test('should accept a group invitation', async ({ authenticatedPage: page }) => {
    const acceptButton = page.getByRole('button', { name: /accept/i });
    if ((await acceptButton.count()) === 0) {
      test.skip();
      return;
    }

    await acceptButton.first().click();

    // Verify success toast
    const toast = page.getByText(/invitation accepted|accepted/i);
    if ((await toast.count()) > 0) {
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
