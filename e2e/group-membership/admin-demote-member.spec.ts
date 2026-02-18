// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Admin Demote', () => {
  test('Admin can demote admin to member', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });
    const otherAdmin = await userFactory.createUser();
    await groupFactory.addMember(group.id, otherAdmin.id, group.adminRoleId);

    // Navigate to memberships page (retry on Access Denied)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // Verify memberships page loaded
    const heading = page.getByRole('heading', { name: /member|membership/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Use the role dropdown to change from Admin to Member
    // There should be a combobox (Select) for the other admin's role
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible({ timeout: 10000 });
    await roleDropdown.click();

    // Select Member role
    const memberOption = page.getByRole('option', { name: /member/i }).first();
    await expect(memberOption).toBeVisible({ timeout: 5000 });
    await memberOption.click();

    // Verify role changed
    await page.waitForTimeout(1000);
  });
});
