// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can delete role', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to Roles tab
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible();
    await rolesTab.click();

    // 2. Author finds role to delete
    const roleItem = page.locator('.role-item, [data-role]').first();
    await expect(roleItem).toBeVisible();

    const roleCount = await page.locator('.role-item, [data-role]').count();

    // 3. Author clicks delete icon
    const deleteButton = roleItem.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();

    // Confirm deletion if dialog appears
    const confirmDialog = page.getByRole('dialog');
    if (await confirmDialog.isVisible()) {
      const confirmButton = confirmDialog.getByRole('button', { name: /confirm|delete/i });
      await confirmButton.click();
    }

    // 4. Role is removed
    const newRoleCount = await page.locator('.role-item, [data-role]').count();
    expect(newRoleCount).toBe(roleCount - 1);

    // 5. Collaborators with that role are updated
    await expect(page.getByText(/role deleted|removed/i)).toBeVisible();
  });
});
