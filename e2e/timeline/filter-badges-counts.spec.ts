// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Filter Badges and Counts', () => {
  test('Filter tabs show event counts in badges', async ({ page }) => {
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
      // 5. Verify All tab has count badge
      const allTab = page.getByRole('tab', { name: /all/i });
      const allBadge = allTab.locator('[class*="Badge"]');
      await expect(allBadge).toBeVisible();

      // 6. Verify badge shows number
      const allCount = await allBadge.textContent();
      expect(allCount).toMatch(/^\d+$/);
      expect(parseInt(allCount || '0')).toBeGreaterThan(0);

      // 7. Check other filter badges
      const filters = [
        page.getByRole('tab', { name: /amendment/i }),
        page.getByRole('tab', { name: /event/i }),
        page.getByRole('tab', { name: /group/i }),
        page.getByRole('tab', { name: /blog/i }),
        page.getByRole('tab', { name: /user/i }),
      ];

      for (const filter of filters) {
        const isVisible = await filter.isVisible().catch(() => false);
        if (isVisible) {
          const badge = filter.locator('[class*="Badge"]');
          await expect(badge).toBeVisible();

          const count = await badge.textContent();
          expect(count).toMatch(/^\d+$/);
        }
      }
    }
  });

  test('Badge counts match displayed events', async ({ page }) => {
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
      // 5. Get All tab count
      const allTab = page.getByRole('tab', { name: /all/i });
      const allBadge = allTab.locator('[class*="Badge"]');
      const badgeCount = await allBadge.textContent();

      // 6. Verify description also shows count
      const description = page
        .locator('p[class*="CardDescription"]')
        .filter({ hasText: /update/i });
      const descText = await description.textContent();

      expect(descText).toContain(badgeCount);
    }
  });
});
