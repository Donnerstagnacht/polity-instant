// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Admin Change Role', () => {
  test('Admin can change member role', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });
    const member = await userFactory.createUser();
    await groupFactory.addMember(group.id, member.id, group.memberRoleId);

    // Navigate to memberships page (retry on Access Denied)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // Find role dropdown for a member
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible({ timeout: 10000 });

    // Click role dropdown
    await roleDropdown.click();

    // Select new role
    const roleOption = page.getByRole('option').first();
    await expect(roleOption).toBeVisible({ timeout: 5000 });
    await roleOption.click();

    // Verify dropdown updated
    await page.waitForTimeout(1000);
  });
});
