// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Request to Join', () => {
  test('User can request to join a group', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const owner = await userFactory.createUser();
    const group = await groupFactory.createGroup(owner.id, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify "Request to Join" button is visible
    const requestButton = page.getByRole('button', { name: /request to join/i });
    await expect(requestButton).toBeVisible();

    // 4. Click "Request to Join" button
    await requestButton.click();

    // 5. Verify button changes to "Request Pending"
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    await expect(pendingButton).toBeVisible({ timeout: 15000 });
  });
});
