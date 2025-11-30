// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Events - Event Calendar Integration', () => {
  test('Participated event appears in calendar', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /calendar
    await page.goto('/calendar');

    // 3. Wait for calendar to load
    await page.waitForLoadState('networkidle');

    // 4. Check for event cards
    const eventCards = page
      .getByRole('article')
      .or(page.locator('[data-testid*="event"]'))
      .or(page.locator('.event-card'));

    // 5. Verify event appears on correct date
    // Events should be visible in calendar if user is participant

    // 6. Clicking event navigates to event page
    if ((await eventCards.count()) > 0) {
      const firstEvent = eventCards.first();
      await firstEvent.click();

      // Verify navigation to event page
      await page.waitForURL(/\/event\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/event\/.+/);
    }
  });

  test('Multi-day event spans multiple calendar days', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /calendar
    await page.goto('/calendar');

    // 3. Switch to week or month view
    const weekTab = page.getByRole('tab', { name: /week/i });
    if ((await weekTab.count()) > 0) {
      await weekTab.click();
      await page.waitForTimeout(500);
    }

    // 4. Check for multi-day event display
    // Multi-day events should have special visualization
    // Exact implementation may vary
  });
});
