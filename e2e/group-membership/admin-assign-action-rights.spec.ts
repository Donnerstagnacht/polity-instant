// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Action Rights', () => {
  test('Admin can assign action rights to role', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to Roles tab
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    const rolesTab = page.getByRole('tab', { name: /role/i });
    await rolesTab.click();

    // 3. Find action rights matrix
    const permissionsTable = page.getByRole('table').or(page.getByRole('grid')).first();
    await expect(permissionsTable).toBeVisible();

    // 4. Toggle checkbox for specific permission
    const checkbox = page.getByRole('checkbox').first();
    const wasChecked = await checkbox.isChecked();

    await checkbox.click();

    // 5. Verify checkbox state changed
    const isNowChecked = await checkbox.isChecked();
    expect(isNowChecked).toBe(!wasChecked);
  });
});
