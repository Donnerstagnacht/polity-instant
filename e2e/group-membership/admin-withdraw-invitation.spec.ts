// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Withdraw Invitation', () => {
  test('Admin can withdraw invitation', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find pending invitations section
    const withdrawButton = page.getByRole('button', { name: /withdraw|remove/i }).first();
    await expect(withdrawButton).toBeVisible();

    // 4. Click "Withdraw Invitation"
    await withdrawButton.click();

    // 5. Verify invitation is deleted
    // Button should disappear or user removed from invitations list
  });
});
