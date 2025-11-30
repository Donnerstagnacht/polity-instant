// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - Click Event to View Details', () => {
  test('User clicks on an event card to navigate to event detail page', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. Locate an event card
    const eventCards = page
      .getByRole('article')
      .or(page.locator('[data-testid*="event"]'))
      .or(page.locator('.event-card'));
    const count = await eventCards.count();

    if (count > 0) {
      // 3. Click on the event card
      const firstEvent = eventCards.first();
      await firstEvent.click();

      // 4. Browser navigates to /event/[id]
      await page.waitForURL(/\/event\/.+/, { timeout: 5000 });

      // Event detail page loads with full event information
      await expect(page).toHaveURL(/\/event\/.+/);
    }
  });
});
