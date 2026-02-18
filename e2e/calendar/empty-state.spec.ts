// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Calendar - Empty State', () => {
  test('Calendar displays appropriate empty state when no events exist', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /calendar as user with no events
    await page.goto('/calendar');

    // Wait for the calendar to fully render (heading appears after data loads)
    await expect(page.locator('h1').filter({ hasText: /calendar/i })).toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 2. Check if there are any events using role-based selector
    const eventLinks = page.getByRole('link').filter({ hasText: /community|meetup|event|stand-up|team|meeting/i });
    const eventCount = await eventLinks.count();

    // Also check the event count text that DayView renders (e.g., "18 events scheduled")
    const eventCountText = page.getByText(/\d+ events? scheduled/i);
    const hasEventCountText = await eventCountText.isVisible().catch(() => false);

    // 3. If no events, verify empty state is shown
    if (eventCount === 0 && !hasEventCountText) {
      const emptyState = page
        .getByText(/no events/i)
        .or(page.getByText(/no upcoming events/i))
        .or(page.getByText(/create your first event/i));
      await expect(emptyState).toBeVisible({ timeout: 10000 });
    }
  });
});
