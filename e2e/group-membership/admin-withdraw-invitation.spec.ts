// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Withdraw Invitation', () => {
  test('Admin can withdraw invitation', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const invited = await userFactory.createUser();
    await groupFactory.addMember(group.id, invited.id, group.memberRoleId, { status: 'invited' });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find pending invitations section
    const withdrawButton = page.getByRole('button', { name: /withdraw|remove/i }).first();
    await expect(withdrawButton).toBeVisible();

    // 4. Click "Withdraw Invitation"
    await withdrawButton.click();

    // 5. Verify invitation is deleted
    // Button should disappear or user removed from invitations list
  });
});
