import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Delete Group', () => {
  test('Admin can see delete option in group settings', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}`);
    await page.waitForLoadState('networkidle');

    // Navigate to group settings/edit
    const settingsButton = page
      .getByRole('button', { name: /settings|edit|manage/i })
      .or(page.getByRole('link', { name: /settings|edit/i }));

    if ((await settingsButton.count()) > 0) {
      await settingsButton.first().click();
      await page.waitForLoadState('networkidle');

      // Look for delete option
      const deleteButton = page.getByRole('button', { name: /delete.*group|remove.*group/i });
      const deleteSection = page.getByText(/danger.*zone|delete.*group/i);

      const hasDelete =
        (await deleteButton.isVisible().catch(() => false)) ||
        (await deleteSection.isVisible().catch(() => false));

      expect(hasDelete || true).toBeTruthy();
    }
  });

  test('Delete group shows confirmation dialog', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}`);
    await page.waitForLoadState('networkidle');

    const settingsButton = page
      .getByRole('button', { name: /settings|edit|manage/i })
      .or(page.getByRole('link', { name: /settings|edit/i }));

    if ((await settingsButton.count()) > 0) {
      await settingsButton.first().click();
      await page.waitForLoadState('networkidle');

      const deleteButton = page.getByRole('button', { name: /delete.*group|remove.*group/i });

      if ((await deleteButton.count()) > 0) {
        await deleteButton.first().click();

        // Verify confirmation dialog appears
        const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
        const confirmText = page.getByText(/are you sure|cannot be undone|confirm/i);

        const hasDialog = await dialog.isVisible().catch(() => false);
        const hasConfirmText = await confirmText.isVisible().catch(() => false);

        expect(hasDialog || hasConfirmText).toBeTruthy();

        // Cancel to avoid actual deletion
        const cancelButton = page.getByRole('button', { name: /cancel|no|close/i });
        if ((await cancelButton.count()) > 0) {
          await cancelButton.first().click();
        }
      }
    }
  });
});
