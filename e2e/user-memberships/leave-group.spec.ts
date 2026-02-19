import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Leave Group', () => {
  test('should show Leave button on active memberships', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    // Create a group where the user is a member (not admin/owner)
    const group = await groupFactory.createGroup(mainUserId);

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const activeMemberships = page.getByText(/active memberships/i);
    await expect(activeMemberships.first()).toBeVisible({ timeout: 10000 });

    const leaveButton = page.getByRole('button', { name: /leave/i });
    await expect(leaveButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show Withdraw Request button on pending requests', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
    userFactory,
  }) => {
    // Create a group owned by another user, then add mainUser as 'requested'
    const otherUser = await userFactory.createUser({ name: 'E2E Group Owner' });
    const group = await groupFactory.createGroup(otherUser.id);
    await groupFactory.addMember(group.id, mainUserId, group.memberRoleId, { status: 'requested' });

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const pendingRequests = page.getByText(/pending requests/i);
    await expect(pendingRequests.first()).toBeVisible({ timeout: 10000 });

    const withdrawButton = page.getByRole('button', { name: /withdraw/i });
    await expect(withdrawButton.first()).toBeVisible({ timeout: 5000 });
  });
});
