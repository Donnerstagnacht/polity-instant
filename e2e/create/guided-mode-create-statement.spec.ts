import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Statement', async ({ authenticatedPage: page }) => {
    await page.goto('/create/statement');

    // Step 0: Statement text
    const textInput = page.locator('#statement-text');
    await expect(textInput).toBeVisible();
    await textInput.fill('We should increase funding for renewable energy projects');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Step 0→1 (Tag & Visibility)
    await nextButton.click();

    // Step 1: Fill required tag
    const tagInput = page.locator('#statement-tag');
    if (await tagInput.isVisible()) {
      await tagInput.fill('energy');
    }

    // Step 1→2 (Review)
    await nextButton.click();

    // Step 2: Review - Click Create Statement
    const createButton = page.getByRole('button', { name: /create.*statement/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for success
    await page.waitForLoadState('networkidle');

    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const isRedirected = page.url().includes('/statement/') || page.url().includes('/user/');
    expect(successMessage || isRedirected).toBeTruthy();
  });
});
