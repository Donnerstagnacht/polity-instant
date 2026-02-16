// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Accept Invitation', () => {
  test('User can accept group invitation', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const owner = await userFactory.createUser();
    const group = await groupFactory.createGroup(owner.id, {
      name: `Test Group ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await groupFactory.addMember(group.id, testUser.id, group.memberRoleId, { status: 'invited' });

    // 1. Authenticate as test user
    // 2. Navigate to group page where user is invited
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify "Accept Invitation" button is visible
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });
    await expect(acceptButton).toBeVisible();

    // 4. Click "Accept Invitation" button
    await acceptButton.click();

    // 5. Verify button changes to "Leave Group"
    const leaveButton = page.getByRole('button', { name: /leave group|leave/i });
    await expect(leaveButton).toBeVisible();
  });
});
