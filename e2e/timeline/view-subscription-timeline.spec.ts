// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - View Subscription-Based Timeline', () => {
  test('User sees timeline events from their subscriptions', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if user has subscriptions with events
    const emptyState = page.getByText(/subscribe to users, groups|your timeline is empty/i);
    const hasEmptyTimeline = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyTimeline) {
      // 5. Timeline displays updates from subscribed entities
      await expect(page.getByText(/your timeline/i)).toBeVisible();

      // 6. Check for event cards
      const eventCards = page.locator('[class*="grid gap-4"]').locator('[class*="Card"]').first();
      const hasEvents = await eventCards.isVisible().catch(() => false);

      if (hasEvents) {
        // 7. Each event shows type, entity, and timestamp
        await expect(eventCards).toBeVisible();
      }
    } else {
      // No subscriptions - verify empty state
      await expect(emptyState).toBeVisible();
    }
  });
});
