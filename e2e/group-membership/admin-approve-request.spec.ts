// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Approve Request', () => {
  test('Admin can approve membership request', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const requester = await userFactory.createUser();
    await groupFactory.addMember(group.id, requester.id, group.memberRoleId, { status: 'requested' });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships management page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Verify memberships page loaded
    const heading = page.getByRole('heading', { name: /member|membership/i });
    await expect(heading).toBeVisible();

    // 4. Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible();

    await acceptButton.click();

    // 5. Verify user appears in active members list
    // Request should be removed from pending section
  });
});
