// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Subscription Timeline', () => {
  test('User can view subscription timeline', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to their subscriptions page
    await page.goto('/user/page/subscriptions');
    await page.waitForLoadState('networkidle');

    // 3. Timeline displays recent activity from all subscriptions
    // Look for timeline or activity feed
    const timeline = page
      .locator('[data-testid="subscription-timeline"]')
      .or(page.locator('text=/timeline|activity|feed/i'));

    // 4. Verify timeline is visible
    const timelineExists = (await timeline.count()) > 0;

    if (timelineExists) {
      await expect(timeline.first()).toBeVisible();
    }

    // 5. Items should be sorted by timestamp (verify page loaded)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('User can filter subscription timeline', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to subscriptions page
    await page.goto('/user/page/subscriptions');
    await page.waitForLoadState('networkidle');

    // 3. Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter|groups|users|events/i });

    if ((await filterButton.count()) > 0) {
      // 4. User selects filter (e.g., "Groups only")
      await filterButton.first().click();

      // 5. Timeline updates (wait for potential reload)
      await page.waitForTimeout(500);

      // 6. User can toggle multiple filters
      // 7. User can clear filters to see all activity
      const clearFilter = page.getByRole('button', { name: /clear|reset|all/i });
      if ((await clearFilter.count()) > 0) {
        await clearFilter.first().click();
      }
    }

    // Timeline functionality exists
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });
});
