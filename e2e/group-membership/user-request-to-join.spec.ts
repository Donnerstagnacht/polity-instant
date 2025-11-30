// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Request to Join', () => {
  test('User can request to join a group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup1);

    // 3. Verify "Request to Join" button is visible
    const requestButton = page.getByRole('button', { name: /request to join/i });
    await expect(requestButton).toBeVisible();

    // 4. Click "Request to Join" button
    await requestButton.click();

    // 5. Verify button changes to "Request Pending"
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    await expect(pendingButton).toBeVisible();
  });
});
