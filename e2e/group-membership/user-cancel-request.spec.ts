// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Cancel Request', () => {
  test('User can cancel pending request', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup1);

    // 3. Ensure user has pending request
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    const requestButton = page.getByRole('button', { name: /^request to join$/i });

    const hasPendingRequest = await pendingButton.isVisible().catch(() => false);

    if (!hasPendingRequest) {
      await requestButton.click();
      await expect(pendingButton).toBeVisible();
    }

    // 4. Click "Request Pending" button to cancel
    await pendingButton.click();

    // 5. Verify button changes back to "Request to Join"
    await expect(requestButton).toBeVisible();
  });
});
