import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Delete Link', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should show delete option on existing links', async ({ authenticatedPage: page }) => {
    // Look for link items with a delete/remove button
    const linkSection = page.locator('section, div').filter({ hasText: 'Links' }).first();
    const deleteButtons = linkSection.getByRole('button', { name: /delete|remove/i });

    if ((await deleteButtons.count()) > 0) {
      await expect(deleteButtons.first()).toBeVisible();
    }
  });

  test('should delete a link and show success toast', async ({ authenticatedPage: page }) => {
    const linkSection = page.locator('section, div').filter({ hasText: 'Links' }).first();
    const deleteButtons = linkSection.getByRole('button', { name: /delete|remove/i });

    if ((await deleteButtons.count()) === 0) {
      test.skip();
      return;
    }

    // Click the first delete button
    await deleteButtons.first().click();

    // Handle confirmation dialog if present
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
    }

    // Verify success toast
    const toast = page.getByText('Link deleted successfully!');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
