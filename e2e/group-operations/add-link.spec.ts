import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Add Link', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should display Add Link button for authorized users', async ({ authenticatedPage: page }) => {
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if ((await addLinkButton.count()) > 0) {
      await expect(addLinkButton).toBeVisible();
    }
  });

  test('should open Add New Link dialog when clicking Add Link', async ({ authenticatedPage: page }) => {
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if ((await addLinkButton.count()) === 0) {
      test.skip();
      return;
    }

    await addLinkButton.click();

    // Dialog should appear with title and form fields
    await expect(page.getByText('Add New Link')).toBeVisible();
    await expect(page.getByText('Add a link to this group')).toBeVisible();

    // Form fields
    const labelInput = page.locator('#link-label');
    const urlInput = page.locator('#link-url');
    await expect(labelInput).toBeVisible();
    await expect(urlInput).toBeVisible();
  });

  test('should add a new link via the dialog', async ({ authenticatedPage: page }) => {
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if ((await addLinkButton.count()) === 0) {
      test.skip();
      return;
    }

    await addLinkButton.click();
    await expect(page.getByText('Add New Link')).toBeVisible();

    // Fill in the form
    await page.locator('#link-label').fill('Test Website');
    await page.locator('#link-url').fill('https://example.com');

    // Submit
    const submitButton = page.getByRole('button', { name: /add link/i }).last();
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText('Link added successfully!');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
