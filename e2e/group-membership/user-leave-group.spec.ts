// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Leave Group', () => {
  test('Member can leave group', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const owner = await userFactory.createUser();
    const group = await groupFactory.createGroup(owner.id, {
      name: `Test Group ${Date.now()}`,
    });
    await groupFactory.addMember(group.id, mainUserId, group.memberRoleId);

    // Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for the membership button to appear
    const leaveButton = page.getByRole('button', { name: /leave group/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    // Wait for either button to appear (InstantDB sync may take a moment)
    await expect(leaveButton.or(acceptButton)).toBeVisible({ timeout: 15000 });

    const isMember = await leaveButton.isVisible().catch(() => false);

    if (!isMember) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible({ timeout: 10000 });
    }

    // Click "Leave Group" button
    await leaveButton.click();

    // Verify button changes to "Request to Join"
    const requestButton = page.getByRole('button', { name: /request to join/i });
    await expect(requestButton).toBeVisible({ timeout: 10000 });
  });
});
