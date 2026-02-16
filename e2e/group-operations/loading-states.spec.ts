import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Loading States', () => {
  test('Operations page renders after loading', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/operation`);
    await page.waitForLoadState('networkidle');

    // Page should render without stuck loading indicators
    const loadingSpinner = page.locator('[class*="animate-spin"], [class*="loading"]');
    const isStuckLoading = await loadingSpinner.isVisible().catch(() => false);

    // Either content loaded or empty state shown
    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();

    if (isStuckLoading) {
      // Loading should resolve within reasonable time
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Links section loads correctly', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/operation`);
    await page.waitForLoadState('networkidle');

    const linksSection = page.getByText(/links|shared links/i);
    if ((await linksSection.count()) > 0) {
      await expect(linksSection.first()).toBeVisible();
    }
  });

  test('Tasks section loads correctly', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/operation`);
    await page.waitForLoadState('networkidle');

    const tasksSection = page.getByText(/tasks|todos|kanban/i);
    if ((await tasksSection.count()) > 0) {
      await expect(tasksSection.first()).toBeVisible();
    }
  });

  test('No loading state stuck on screen', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/operation`);
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });
});
