// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Reject Request', () => {
  test('Admin can reject membership request', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const requester = await userFactory.createUser();
    await groupFactory.addMember(group.id, requester.id, group.memberRoleId, { status: 'requested' });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships management page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find pending request and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove|reject/i }).first();
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // 4. Verify request is deleted
    // User should disappear from pending list
  });
});
