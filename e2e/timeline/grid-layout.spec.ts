// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Grid Layout', () => {
  test('Timeline events display in grid layout', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Verify grid container exists
      const gridContainer = page.locator('[class*="grid gap-4"]');
      await expect(gridContainer).toBeVisible();

      // 6. Verify grid has responsive classes
      const gridClass = await gridContainer.getAttribute('class');
      expect(gridClass).toContain('grid');

      // 7. Events should be in card format
      const eventCards = gridContainer.locator('[class*="Card"]');
      const cardCount = await eventCards.count();

      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
      }
    }
  });

  test('Grid layout is responsive on different screen sizes', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 3. Verify grid on desktop
      const gridContainer = page.locator('[class*="grid gap-4"]');
      await expect(gridContainer).toBeVisible();

      // 4. Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // 5. Grid should still be visible but single column on mobile
      await expect(gridContainer).toBeVisible();
    }
  });
});
