// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Accept Invitation', () => {
  test('User can accept group invitation', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page where user is invited
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup2);

    // 3. Verify "Accept Invitation" button is visible
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });
    await expect(acceptButton).toBeVisible();

    // 4. Click "Accept Invitation" button
    await acceptButton.click();

    // 5. Verify button changes to "Leave Group"
    const leaveButton = page.getByRole('button', { name: /leave group|leave/i });
    await expect(leaveButton).toBeVisible();
  });
});
