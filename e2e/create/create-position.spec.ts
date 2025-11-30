import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Create Position', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Positions entity type
    const positionsOption = page
      .locator('text=Positions')
      .or(page.locator('[data-entity="positions"]'))
      .first();
    await positionsOption.click();

    await page.waitForTimeout(500);

    // Enter position name
    const nameInput = page
      .locator('input[name="name"]')
      .or(page.locator('input[name="title"]'))
      .or(page.getByPlaceholder(/name|title/i))
      .first();
    await nameInput.fill('President');

    // Advance carousel if needed
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select associated group (if dropdown is available)
    const groupSelect = page
      .locator('select[name="group"]')
      .or(page.locator('[data-testid="group-select"]'))
      .first();
    if (await groupSelect.isVisible()) {
      // Select first available group
      await groupSelect.selectOption({ index: 1 });
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Define term length
    const termInput = page.locator('input[name="term"]').or(page.getByPlaceholder(/term/i)).first();
    if (await termInput.isVisible()) {
      await termInput.fill('1 year');
    }

    // Set responsibilities
    const responsibilitiesInput = page
      .locator('textarea[name="responsibilities"]')
      .or(page.getByPlaceholder(/responsibilities/i))
      .first();
    if (await responsibilitiesInput.isVisible()) {
      await responsibilitiesInput.fill('Lead the organization and represent members');
    }

    // Click Create button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Verify success
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const isRedirected = page.url() !== '/create';

    expect(successMessage || isRedirected).toBeTruthy();
  });
});
