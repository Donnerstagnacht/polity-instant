// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Loading States', () => {
  test('Loading states display during operations', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Find membership button
    const membershipButton = page
      .getByRole('button', { name: /request to join|leave group|accept invitation/i })
      .first();
    await expect(membershipButton).toBeVisible();

    // 4. Click button
    await membershipButton.click();

    // 5. Verify button becomes disabled (loading state)
    await expect(membershipButton).toBeDisabled();

    // 6. Wait for operation to complete and button to be enabled again
    await expect(membershipButton).not.toBeDisabled();
  });
});
