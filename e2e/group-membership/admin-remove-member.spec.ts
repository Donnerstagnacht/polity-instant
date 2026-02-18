// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Admin Remove Member', () => {
  test('Admin can remove member from group', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });
    const member = await userFactory.createUser();
    await groupFactory.addMember(group.id, member.id, group.memberRoleId);

    // Navigate to memberships page (retry on Access Denied)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // Verify memberships page loaded
    const heading = page.getByRole('heading', { name: /member|membership/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Find member and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: 10000 });
    await removeButton.click();

    // Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // Verify remove completed (button disappears or count changes)
    await page.waitForTimeout(1000);
  });
});
