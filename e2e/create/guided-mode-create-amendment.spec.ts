import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Amendment', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Amendments entity type
    const amendmentsOption = page
      .locator('text=Amendments')
      .or(page.locator('[data-entity="amendments"]'))
      .first();
    await amendmentsOption.click();

    await page.waitForTimeout(500);

    // Enter amendment title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('Climate Action Amendment 2024');

    // Advance carousel
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter amendment subtitle
    const subtitleInput = page
      .locator('input[name="subtitle"]')
      .or(page.getByPlaceholder(/subtitle/i))
      .first();
    if (await subtitleInput.isVisible()) {
      await subtitleInput.fill('An amendment to address climate change policies');
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Add initial document content
    const contentInput = page
      .locator('textarea[name="content"]')
      .or(page.locator('[contenteditable="true"]'))
      .first();
    if (await contentInput.isVisible()) {
      await contentInput.fill('This amendment proposes new climate action policies...');
    }

    // Click Create Amendment button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for navigation or success
    await page.waitForURL(/\/amendment\//, { timeout: 5000 }).catch(() => {
      return;
    });

    // Verify success
    const isRedirected = page.url().includes('/amendment/');
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);

    expect(isRedirected || successMessage).toBeTruthy();
  });
});
