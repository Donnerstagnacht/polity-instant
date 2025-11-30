// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Loading States', () => {
  test('Loading states display during operations', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup1);

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
