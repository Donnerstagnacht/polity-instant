// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Leave Group', () => {
  test('Member can leave group', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const owner = await userFactory.createUser();
    const group = await groupFactory.createGroup(owner.id, {
      name: `Test Group ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await groupFactory.addMember(group.id, testUser.id, group.memberRoleId);

    // 1. Authenticate as test user
    // 2. Navigate to group where user is a member
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Ensure user is a member
    const leaveButton = page.getByRole('button', { name: /leave group|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    const isMember = await leaveButton.isVisible().catch(() => false);

    if (!isMember) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 4. Click "Leave Group" button
    await leaveButton.click();

    // 5. Verify button changes to "Request to Join"
    const requestButton = page.getByRole('button', { name: /request to join/i });
    await expect(requestButton).toBeVisible();
  });
});
