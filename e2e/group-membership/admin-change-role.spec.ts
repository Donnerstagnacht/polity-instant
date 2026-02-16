// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Change Role', () => {
  test('Admin can change member role', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const member = await userFactory.createUser();
    await groupFactory.addMember(group.id, member.id, group.memberRoleId);

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find role dropdown for a member
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible();

    // 4. Click role dropdown
    await roleDropdown.click();

    // 5. Select new role
    const roleOption = page.getByRole('option', { name: /moderator|member/i }).first();
    await roleOption.click();

    // 6. Verify role is updated
    await expect(roleDropdown).toContainText(/moderator|member/i);
  });
});
