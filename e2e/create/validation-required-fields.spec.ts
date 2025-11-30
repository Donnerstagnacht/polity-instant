import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Validation - Required Fields', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select an entity type (e.g., Groups)
    const groupsOption = page
      .locator('text=Groups')
      .or(page.locator('[data-entity="groups"]'))
      .first();
    await groupsOption.click();

    await page.waitForTimeout(500);

    // Try to create without filling required fields
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();

    // Skip to the create button if in carousel mode
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    for (let i = 0; i < 5; i++) {
      if (await createButton.isVisible()) break;
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    // Attempt to create with empty required fields
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    await page.waitForTimeout(500);

    // Verify error messages display
    const errorMessage = await page
      .locator('text=required')
      .or(page.locator('[role="alert"]'))
      .or(page.locator('.error'))
      .first()
      .isVisible()
      .catch(() => false);

    // Alternatively, verify form validation prevents submission
    const stillOnCreatePage = page.url().includes('/create');

    expect(errorMessage || stillOnCreatePage).toBeTruthy();

    // Now fill in required fields
    const nameInput = page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Valid Group Name');
    }

    const descriptionInput = page.locator('textarea[name="description"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Valid description');
    }

    // Try to create again
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Verify validation passes (either redirected or success message)
    await page.waitForTimeout(1000);
    const isRedirected = !page.url().includes('/create') || page.url().includes('/group/');
    const successMessage = await page
      .locator('text=created')
      .first()
      .isVisible()
      .catch(() => false);

    // At least one should be true
    expect(isRedirected || successMessage).toBeTruthy();
  });
});
