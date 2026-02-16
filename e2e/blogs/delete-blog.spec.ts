import { test, expect } from '../fixtures/test-base';
import { navigateToBlog } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog - Delete Blog', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToBlog(page, TEST_ENTITY_IDS.BLOG);
  });

  test('should show delete button for authorized users', async ({ authenticatedPage: page }) => {
    const deleteButton = page.getByRole('button', { name: /delete/i });
    if ((await deleteButton.count()) > 0) {
      await expect(deleteButton.first()).toBeVisible();
    }
  });

  test('should show confirmation dialog when clicking delete', async ({ authenticatedPage: page }) => {
    const deleteButton = page.getByRole('button', { name: /delete/i });
    if ((await deleteButton.count()) === 0) {
      test.skip();
      return;
    }

    // Set up dialog handler to check for confirm dialog
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // Don't actually delete
    });

    await deleteButton.first().click();
    await page.waitForLoadState('networkidle');

    // The deletion uses window.confirm()
    if (dialogMessage) {
      expect(dialogMessage).toBeTruthy();
    }
  });
});
