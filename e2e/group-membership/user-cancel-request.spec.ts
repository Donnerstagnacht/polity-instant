// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Cancel Request', () => {
  test('User can cancel pending request', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const owner = await userFactory.createUser();
    const group = await groupFactory.createGroup(owner.id, {
      name: `Test Group ${Date.now()}`,
    });

    // Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for the membership button to load
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    const requestButton = page.getByRole('button', { name: /request to join/i });

    // Wait for request button to appear first
    await expect(requestButton.or(pendingButton)).toBeVisible({ timeout: 15000 });

    const hasPendingRequest = await pendingButton.isVisible().catch(() => false);

    if (!hasPendingRequest) {
      await requestButton.click();
      await expect(pendingButton).toBeVisible({ timeout: 10000 });
    }

    // Click "Request Pending" button to cancel
    await pendingButton.click();

    // Verify button changes back to "Request to Join"
    await expect(requestButton).toBeVisible({ timeout: 10000 });
  });
});
