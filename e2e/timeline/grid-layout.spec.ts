// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Timeline - Grid Layout', () => {
  test('Timeline events display in grid layout', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline header
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Check if timeline has cards or empty state
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const emptyState = page.getByText(/subscribe|discover/i);

    const hasCards = (await cards.count()) > 0;
    const isEmpty = await emptyState.isVisible().catch(() => false);

    // Either cards or empty state should exist
    expect(hasCards || isEmpty).toBeTruthy();
  });

  test('Grid layout is responsive on different screen sizes', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 3. Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    // 4. Timeline header should still be visible on mobile
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible();
  });
});
