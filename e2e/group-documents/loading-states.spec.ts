import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Documents - Loading States', () => {
  test('Documents list page renders after loading', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/editor`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/editor`);
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
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/editor`);
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
});
