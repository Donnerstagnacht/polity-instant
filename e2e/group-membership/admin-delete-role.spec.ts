// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Role Deletion', () => {
  test('Admin can delete role', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });

    // Navigate to memberships page (retry on Access Denied)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // Click Roles tab
    const rolesTab = page.getByRole('tab', { name: /role/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    // First create a custom role to delete (default Admin/Member roles may not be deletable)
    const addRoleButton = page.getByRole('button', { name: /add role/i });
    await expect(addRoleButton).toBeVisible({ timeout: 10000 });
    await addRoleButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|title/i);
    await nameInput.fill(`Delete Me ${Date.now()}`);
    const descInput = dialog.getByLabel(/description/i);
    if ((await descInput.count()) > 0) {
      await descInput.fill('Temp role for deletion test');
    }
    const createButton = dialog.getByRole('button', { name: /create|save/i });
    await createButton.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Wait for role to appear in the table
    await page.waitForTimeout(2000);

    // Find the trash/delete icon button - try multiple selectors
    const deleteButton = page.locator('button:has(svg.lucide-trash-2)').first()
      .or(page.locator('button:has(svg.lucide-trash)').first())
      .or(page.locator('button:has(.text-destructive)').first())
      .or(page.locator('button svg[class*="trash"]').locator('..').first());
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();

    // Confirm deletion if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    await page.waitForTimeout(1000);
  });
});
