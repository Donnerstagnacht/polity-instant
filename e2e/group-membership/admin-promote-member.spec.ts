// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Promote', () => {
  test('Admin can promote member to admin', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find member and click "Promote to Board Member"
    const promoteButton = page.getByRole('button', { name: /promote.*board|make.*admin/i }).first();
    await expect(promoteButton).toBeVisible();

    await promoteButton.click();

    // 4. Verify member's role changed to "Board Member"
    const boardMemberLabel = page.locator('text=/board member|admin/i').first();
    await expect(boardMemberLabel).toBeVisible();
  });
});
