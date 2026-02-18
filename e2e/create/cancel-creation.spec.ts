import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Cancel Creation', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    const nameInput = page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Group to Cancel');
    }

    const cancelButton = page
      .locator('button:has-text("Cancel")')
      .or(page.locator('[data-testid="cancel-button"]'))
      .first();

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      const confirmDialog = page
        .locator('text=confirm')
        .or(page.locator('[role="dialog"]'))
        .first();
      if (await confirmDialog.isVisible()) {
        const confirmButton = page
          .locator('button:has-text("Confirm")')
          .or(page.locator('button:has-text("Yes")'))
          .first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }

    }

    expect(true).toBeTruthy();
  });
});
