// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Admin Approve Request', () => {
  test('Admin can approve membership request', async ({ authenticatedPage: page, groupFactory, userFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });
    const requester = await userFactory.createUser();
    await groupFactory.addMember(group.id, requester.id, group.memberRoleId, { status: 'requested' });

    // Navigate to memberships management page (retry on Access Denied)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // Verify memberships page loaded
    const heading = page.getByRole('heading', { name: /member|membership/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible({ timeout: 10000 });

    await acceptButton.click();

    // Verify request is removed from pending section
    await expect(acceptButton).not.toBeVisible({ timeout: 5000 });
  });
});
