// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Demote', () => {
  test('Admin can demote admin to member', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find board member and click "Demote to Member"
    const demoteButton = page
      .getByRole('button', { name: /demote.*member|remove.*admin/i })
      .first();
    await expect(demoteButton).toBeVisible();

    await demoteButton.click();

    // 4. Verify member's role changed to "Member"
    const memberLabel = page.locator('text=/^member$/i').first();
    await expect(memberLabel).toBeVisible();
  });
});
