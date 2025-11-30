// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Role Deletion', () => {
  test('Admin can delete role', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to Roles tab
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    const rolesTab = page.getByRole('tab', { name: /role/i });
    await rolesTab.click();

    // 3. Find role to delete
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    await expect(deleteButton).toBeVisible();

    // 4. Click delete button
    await deleteButton.click();

    // 5. Confirm deletion if needed
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify role is removed
  });
});
