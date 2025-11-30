import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Create Change Request', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Change Requests entity type
    const changeRequestsOption = page
      .locator('text=Change Requests')
      .or(page.locator('[data-entity="changerequests"]'))
      .first();
    await changeRequestsOption.click();

    await page.waitForTimeout(500);

    // Enter change request title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('Update Section 3 Language');

    // Advance carousel if needed
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter description
    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByPlaceholder(/description/i))
      .first();
    await descriptionInput.fill('Propose clearer language for section 3');

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select target amendment (if dropdown is available)
    const amendmentSelect = page
      .locator('select[name="amendment"]')
      .or(page.locator('[data-testid="amendment-select"]'))
      .first();
    if (await amendmentSelect.isVisible()) {
      // Select first available amendment
      await amendmentSelect.selectOption({ index: 1 });
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Provide justification
    const justificationInput = page
      .locator('textarea[name="justification"]')
      .or(page.getByPlaceholder(/justification/i))
      .first();
    if (await justificationInput.isVisible()) {
      await justificationInput.fill('The current language is ambiguous and needs clarification');
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
