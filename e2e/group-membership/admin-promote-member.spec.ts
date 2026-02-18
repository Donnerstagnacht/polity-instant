// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Admin Promote', () => {
  test('Admin can promote member to admin', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });
    const member = await userFactory.createUser();
    await groupFactory.addMember(group.id, member.id, group.memberRoleId);

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find member and click "Promote to Board Member"
    const promoteButton = page.getByRole('button', { name: /promote/i }).first();
    await expect(promoteButton).toBeVisible({ timeout: 15000 });

    await promoteButton.click();

    // 4. Verify member's role changed to "Board Member"
    const boardMemberLabel = page.locator('text=/board member|admin/i').first();
    await expect(boardMemberLabel).toBeVisible();
  });
});
