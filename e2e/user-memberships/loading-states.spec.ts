import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Loading States', () => {
  test('Memberships page renders after loading', async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Membership tabs render correctly', async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');

    // Should have tabs for different membership types
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      // Click each tab and verify it loads
      for (let i = 0; i < Math.min(tabCount, 4); i++) {
        await tabs.nth(i).click();
        await page.waitForLoadState('domcontentloaded');

        const loadingIndicators = page.locator('[class*="animate-spin"], [aria-busy="true"]');
        const loadCount = await loadingIndicators.count();
        for (let j = 0; j < loadCount; j++) {
          await expect(loadingIndicators.nth(j)).not.toBeVisible({ timeout: 10000 });
        }
      }
    }
  });
});
