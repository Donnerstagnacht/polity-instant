import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Validation - Required Fields', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    // Next button should be disabled when name is empty
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextButton).toBeDisabled();

    // Fill in name - Next should become enabled
    await page.locator('#group-name').fill('Valid Group Name');
    await expect(nextButton).toBeEnabled();

    // Navigate through all steps
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }

    // Create button should be visible on review step
    const createButton = page.getByRole('button', { name: /create group/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Verify we get redirected or see success
    await page.waitForURL(/\/group\//, { timeout: 10000 }).catch(() => {});
    const isRedirected = page.url().includes('/group/');
    const successMessage = await page
      .locator('text=created')
      .first()
      .isVisible()
      .catch(() => false);
    expect(isRedirected || successMessage).toBeTruthy();
  });
});
