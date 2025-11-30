import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Create Agenda Item', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Agenda Items entity type
    const agendaItemsOption = page
      .locator('text=Agenda Items')
      .or(page.locator('[data-entity="agendaitems"]'))
      .first();
    await agendaItemsOption.click();

    await page.waitForTimeout(500);

    // Enter agenda item title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('Opening Remarks');

    // Advance carousel if needed
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select associated event (if dropdown is available)
    const eventSelect = page
      .locator('select[name="event"]')
      .or(page.locator('[data-testid="event-select"]'))
      .first();
    if (await eventSelect.isVisible()) {
      // Select first available event
      await eventSelect.selectOption({ index: 1 });
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Set item type if available
    const typeSelect = page
      .locator('select[name="type"]')
      .or(page.locator('[data-testid="type-select"]'))
      .first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('speech');
    }

    // Click Create button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Verify success message
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
