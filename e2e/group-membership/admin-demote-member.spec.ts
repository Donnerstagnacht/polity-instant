// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Demote', () => {
  test('Admin can demote admin to member', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const otherAdmin = await userFactory.createUser();
    await groupFactory.addMember(group.id, otherAdmin.id, group.adminRoleId);

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find board member and click "Demote to Member"
    const demoteButton = page
      .getByRole('button', { name: /demote.*member|remove.*admin/i })
      .first();
    await expect(demoteButton).toBeVisible();

    await demoteButton.click();

    // 4. Verify member's role changed to "Member"
    const memberLabel = page.locator('text=/^member$/i').first();
    await expect(memberLabel).toBeVisible();
  });
});
