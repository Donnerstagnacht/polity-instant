import { test, expect } from '../fixtures/test-base';

test.describe('Editor - Loading States', () => {
  test('Editor page renders after loading', async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Documents list or empty state shown', async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    const hasDocuments = await page
      .locator('[class*="document"], [class*="card"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no documents|create.*document|get started/i)
      .isVisible()
      .catch(() => false);
    const hasCreateButton = await page
      .getByRole('button', { name: /create|new|add/i })
      .isVisible()
      .catch(() => false);

    expect(hasDocuments || hasEmptyState || hasCreateButton).toBeTruthy();
  });

  test('No loading state stuck on screen after opening document', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    // If there are documents, open the first one
    const firstDoc = page.locator('[class*="document"], [class*="card"]').first();
    if ((await firstDoc.count()) > 0 && (await firstDoc.isVisible().catch(() => false))) {
      await firstDoc.click();
      await page.waitForLoadState('networkidle');

      const loadingIndicators = page.locator(
        '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
      );
      const count = await loadingIndicators.count();
      for (let i = 0; i < count; i++) {
        await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
      }
    }
  });
});
