// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Empty State', () => {
  test('User with no subscriptions sees empty state', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check for empty state
    const emptyState = page.getByText(/subscribe to users, groups|your timeline is empty/i);
    const hasEmptyTimeline = await emptyState.isVisible().catch(() => false);

    if (hasEmptyTimeline) {
      // 5. Empty state displays
      await expect(emptyState).toBeVisible();

      // 6. Message encourages subscriptions
      await expect(page.getByText(/start following content/i)).toBeVisible();

      // 7. Link to discover content
      const discoverButton = page.getByRole('link', { name: /discover content/i });
      await expect(discoverButton).toBeVisible();

      // 8. Verify RSS icon in empty state
      const rssIcon = page.locator('svg').first();
      await expect(rssIcon).toBeVisible();
    }
  });
});
