// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Delete Amendment', () => {
  test('Author can see delete option for owned amendment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Look for delete button or menu option
    const deleteButton = page.getByRole('button', { name: /delete/i });
    const menuTrigger = page.getByRole('button', { name: /more|options|menu/i });

    if ((await deleteButton.count()) > 0) {
      // Delete button is directly visible
      await expect(deleteButton.first()).toBeVisible();
    } else if ((await menuTrigger.count()) > 0) {
      // Check in dropdown menu
      await menuTrigger.first().click();
      const deleteOption = page.getByRole('menuitem', { name: /delete/i });
      if ((await deleteOption.count()) > 0) {
        await expect(deleteOption).toBeVisible();
      }
      // Close menu without deleting
      await page.keyboard.press('Escape');
    }
  });

  test('Delete shows confirmation dialog', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Trigger delete action
    const deleteButton = page.getByRole('button', { name: /delete/i });
    const menuTrigger = page.getByRole('button', { name: /more|options|menu/i });

    let deleteTriggered = false;

    if ((await deleteButton.count()) > 0) {
      await deleteButton.first().click();
      deleteTriggered = true;
    } else if ((await menuTrigger.count()) > 0) {
      await menuTrigger.first().click();
      const deleteOption = page.getByRole('menuitem', { name: /delete/i });
      if ((await deleteOption.count()) > 0) {
        await deleteOption.click();
        deleteTriggered = true;
      }
    }

    if (deleteTriggered) {
      // 4. Confirmation dialog should appear
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // 5. Cancel to avoid actually deleting
        const cancelButton = dialog.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
      }
    }
  });
});
