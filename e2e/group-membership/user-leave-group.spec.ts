// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Leave Group', () => {
  test('Member can leave group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group where user is a member
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup2);

    // 3. Ensure user is a member
    const leaveButton = page.getByRole('button', { name: /leave group|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    const isMember = await leaveButton.isVisible().catch(() => false);

    if (!isMember) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 4. Click "Leave Group" button
    await leaveButton.click();

    // 5. Verify button changes to "Request to Join"
    const requestButton = page.getByRole('button', { name: /request to join/i });
    await expect(requestButton).toBeVisible();
  });
});
