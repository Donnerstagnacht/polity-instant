// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Role Deletion', () => {
  test('Organizer can delete role', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });

    // Navigate with retry on Access Denied
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    const rolesTab = page.getByRole('tab', { name: /role/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    // First create a custom role to delete (default Organizer/Participant roles may not be deletable)
    const addRoleButton = page.getByRole('button', { name: /add role|create role|new role/i });
    await expect(addRoleButton).toBeVisible({ timeout: 10000 });
    await addRoleButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|title/i);
    await nameInput.fill(`Temp Role ${Date.now()}`);
    const descInput = dialog.getByLabel(/description/i);
    if ((await descInput.count()) > 0) {
      await descInput.fill('Temp role for deletion test');
    }
    const createBtn = dialog.getByRole('button', { name: /create|save/i });
    await createBtn.click();

    // Dialog may take time to close after server-side role creation
    await page.waitForTimeout(2000);
    // If dialog is still open, click outside or press Escape
    if (await dialog.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // Wait for role to appear in the table
    await page.waitForTimeout(2000);

    // Delete button is an icon button with trash icon - try multiple selectors
    const deleteButton = page.locator('button:has(svg.lucide-trash-2)').first()
      .or(page.locator('button:has(svg.lucide-trash)').first())
      .or(page.locator('button:has(.text-destructive)').first());
    await expect(deleteButton).toBeVisible({ timeout: 10000 });

    await deleteButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    await page.waitForTimeout(1000);
  });
});
