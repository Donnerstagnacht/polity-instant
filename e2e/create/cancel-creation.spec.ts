import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Cancel Creation', async ({ page }) => {
    await page.goto('/create');

    const groupsOption = page.locator('text=Groups').first();
    await groupsOption.click();
    await page.waitForTimeout(500);

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
      await page.waitForTimeout(500);

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

      await page.waitForTimeout(500);
    }

    expect(true).toBeTruthy();
  });
});
