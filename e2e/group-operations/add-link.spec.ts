import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Operations - Add Link', () => {
  test('should display Add Link button for authorized users', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Link Display Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addLinkButton = page.getByRole('button', { name: /add link/i });
    await expect(addLinkButton).toBeVisible({ timeout: 10000 });
  });

  test('should open Add New Link dialog when clicking Add Link', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Link Dialog Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addLinkButton = page.getByRole('button', { name: /add link/i });
    await expect(addLinkButton).toBeVisible({ timeout: 10000 });
    await addLinkButton.click();

    // Dialog should appear with title and form fields
    await expect(page.getByText('Add New Link')).toBeVisible();

    // Form fields
    const labelInput = page.locator('#link-label');
    const urlInput = page.locator('#link-url');
    await expect(labelInput).toBeVisible();
    await expect(urlInput).toBeVisible();
  });

  test('should add a new link via the dialog', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Add Link Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addLinkButton = page.getByRole('button', { name: /add link/i });
    await expect(addLinkButton).toBeVisible({ timeout: 10000 });
    await addLinkButton.click();
    await expect(page.getByText('Add New Link')).toBeVisible();

    // Fill in the form
    await page.locator('#link-label').fill('Test Website');
    await page.locator('#link-url').fill('https://example.com');

    // Submit - the submit button is also "Add Link"
    const submitButton = page.getByRole('button', { name: /add link/i }).last();
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText(/link added/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
