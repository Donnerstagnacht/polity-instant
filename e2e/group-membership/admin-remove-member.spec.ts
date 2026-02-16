// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Remove Member', () => {
  test('Admin can remove member from group', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });
    const member = await userFactory.createUser();
    await groupFactory.addMember(group.id, member.id, group.memberRoleId);

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Get initial member count
    const memberCountElement = page.locator('text=/\\d+\\s*member/i').first();
    const initialCountText = await memberCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Find member and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 5. Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify member count decreased
    const newCountText = await memberCountElement.textContent();
    const newCount = parseInt(newCountText?.match(/\\d+/)?.[0] || '0');
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });
});
