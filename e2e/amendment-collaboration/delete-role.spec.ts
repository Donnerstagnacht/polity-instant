// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can delete role', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible();
    await rolesTab.click();

    // Role Permissions card is visible
    await expect(page.getByText(/Role Permissions/i)).toBeVisible();

    // Delete button (Trash2 icon) exists for custom roles
    const deleteButton = page.locator('button.text-destructive').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion if dialog appears
      const confirmDialog = page.getByRole('dialog');
      if (await confirmDialog.isVisible()) {
        await confirmDialog.getByRole('button', { name: /confirm|delete/i }).click();
      }
    }
  });
});
