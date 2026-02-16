import { test, expect } from '../fixtures/test-base';

test.describe('Meet - Loading States', () => {
  test('Meeting page renders after loading', async ({ authenticatedPage: page }) => {
    await page.goto('/meet');
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page }) => {
    await page.goto('/meet');
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Meeting list or empty state shown', async ({ authenticatedPage: page }) => {
    await page.goto('/meet');
    await page.waitForLoadState('networkidle');

    const hasMeetings = await page
      .locator('[class*="meeting"], [class*="slot"], [class*="card"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no meetings|schedule.*meeting|no.*slots/i)
      .isVisible()
      .catch(() => false);
    const hasCreateButton = await page
      .getByRole('button', { name: /create|schedule|new/i })
      .isVisible()
      .catch(() => false);

    expect(hasMeetings || hasEmptyState || hasCreateButton).toBeTruthy();
  });
});
