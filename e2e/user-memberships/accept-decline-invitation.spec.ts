import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Accept/Decline Invitation', () => {
  test('should show Pending Invitations section', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
    userFactory,
  }) => {
    // Create a group owned by another user and invite mainUser
    const otherUser = await userFactory.createUser({ name: 'E2E Inviter' });
    const group = await groupFactory.createGroup(otherUser.id, { name: 'E2E Invitation Group' });
    await groupFactory.addMember(group.id, mainUserId, group.memberRoleId, { status: 'invited' });

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const pendingInvitations = page.getByText(/pending invitations/i);
    await expect(pendingInvitations.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Accept and Decline buttons on invitations', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Inviter 2' });
    const group = await groupFactory.createGroup(otherUser.id, { name: 'E2E Accept/Decline Group' });
    await groupFactory.addMember(group.id, mainUserId, group.memberRoleId, { status: 'invited' });

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const acceptButton = page.getByRole('button', { name: /accept/i });
    await expect(acceptButton.first()).toBeVisible({ timeout: 10000 });

    const declineButton = page.getByRole('button', { name: /decline/i });
    await expect(declineButton.first()).toBeVisible();
  });

  test('should accept a group invitation', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Inviter 3' });
    const group = await groupFactory.createGroup(otherUser.id, { name: 'E2E Accept Group' });
    await groupFactory.addMember(group.id, mainUserId, group.memberRoleId, { status: 'invited' });

    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const acceptButton = page.getByRole('button', { name: /accept/i });
    await expect(acceptButton.first()).toBeVisible({ timeout: 10000 });
    await acceptButton.first().click();

    // Verify the invitation row with Accept/Decline buttons disappears
    // (the row moves from Pending Invitations to Active Memberships with a Leave button)
    await expect(
      page.getByRole('row', { name: /E2E Accept Group.*Accept.*Decline/i })
    ).toBeHidden({ timeout: 15000 });
  });
});
