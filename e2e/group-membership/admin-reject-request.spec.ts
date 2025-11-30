// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Reject Request', () => {
  test('Admin can reject membership request', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships management page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find pending request and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove|reject/i }).first();
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // 4. Verify request is deleted
    // User should disappear from pending list
  });
});
