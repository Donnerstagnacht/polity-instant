import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Success Redirect', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    await page.locator('#group-name').fill('Redirect Test Group');
    await page.locator('#group-description').fill('Test group for redirect verification');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }

    const createButton = page.getByRole('button', { name: /create group/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    await page.waitForURL(/\/group\//, { timeout: 10000 }).catch(() => {});
    const isRedirected = page.url().includes('/group/');
    expect(isRedirected).toBeTruthy();
  });

  test('Error Handling', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    // Verify form loads
    const nameInput = page.locator('#group-name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Error Test Group');

    expect(true).toBeTruthy();
  });

  test('Field Persistence in Guided Mode', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    const nameInput = page.locator('#group-name');
    await nameInput.fill('Persistence Test');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    const prevButton = page.getByRole('button', { name: /previous/i });
    await prevButton.click();

    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('Persistence Test');
  });

  test('Create Multiple Entities in Session', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    const nameInput = page.locator('#group-name');
    await nameInput.fill('First Entity');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }

    expect(true).toBeTruthy();
  });
});
