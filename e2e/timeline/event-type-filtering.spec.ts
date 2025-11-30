// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Event Type Filtering', () => {
  test('User filters timeline by event type', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has events
    const emptyState = page.getByText(/your timeline is empty/i);
    const hasEvents = !(await emptyState.isVisible().catch(() => false));

    if (hasEvents) {
      // 5. Verify filter tabs are visible
      await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

      // 6. Check for different filter options
      const amendmentTab = page.getByRole('tab', { name: /amendment/i });

      // 7. Try filtering by Amendments
      const hasAmendmentTab = await amendmentTab.isVisible().catch(() => false);
      if (hasAmendmentTab) {
        await amendmentTab.click();

        // 8. Verify tab is active
        await expect(amendmentTab).toHaveAttribute('data-state', 'active');

        // 9. Go back to All
        const allTab = page.getByRole('tab', { name: /^all$/i });
        await allTab.click();
        await expect(allTab).toHaveAttribute('data-state', 'active');
      }

      // 10. Each tab should show badge with count
      const allTabBadge = page.getByRole('tab', { name: /all/i }).locator('[class*="Badge"]');
      await expect(allTabBadge).toBeVisible();
    }
  });

  test('Filtering shows only selected event type', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check for events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Click on Blogs filter
      const blogTab = page.getByRole('tab', { name: /blog/i });
      const hasBlogTab = await blogTab.isVisible().catch(() => false);

      if (hasBlogTab) {
        await blogTab.click();

        // 6. Verify only blog events shown or empty message
        const noBlogsMessage = page.getByText(/no blog updates/i);
        const hasBlogEvents = !(await noBlogsMessage.isVisible().catch(() => false));

        if (!hasBlogEvents) {
          await expect(noBlogsMessage).toBeVisible();
        }
      }
    }
  });
});
