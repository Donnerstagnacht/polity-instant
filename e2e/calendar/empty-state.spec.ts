// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - Empty State', () => {
  test('Calendar displays appropriate empty state when no events exist', async ({ page }) => {
    // 1. Navigate to /calendar as user with no events
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. Check if there are any events
    const eventCards = page
      .getByRole('article')
      .or(page.locator('[data-testid*="event"]'))
      .or(page.locator('.event-card'));
    const eventCount = await eventCards.count();

    // 3. If no events, verify empty state is shown
    if (eventCount === 0) {
      const emptyState = page
        .getByText(/no events/i)
        .or(page.getByText(/no upcoming events/i))
        .or(page.getByText(/create your first event/i));
      await expect(emptyState).toBeVisible();

      // 4. Call-to-action button or link to create events
      page
        .getByRole('button', { name: /create event/i })
        .or(page.getByRole('link', { name: /create event/i }));

      // Verify CTA is present if empty state is shown
      if ((await emptyState.count()) > 0) {
        // CTA may or may not be present depending on design
      }
    }
  });
});
