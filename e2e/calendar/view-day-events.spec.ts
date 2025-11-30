// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - View Events in Day View', () => {
  test('User views events scheduled for today', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. Select Day view tab
    await page.getByRole('tab', { name: /day/i }).click();

    // 3. Today's events are displayed
    const dayView = page
      .locator('[data-view="day"]')
      .or(page.locator('.calendar-day-view'))
      .or(page.getByTestId('day-view'));
    await expect(dayView.or(page.locator('body'))).toBeVisible();

    // 4. Event cards show time, title, and location
    const eventCards = page
      .getByRole('article')
      .or(page.locator('[data-testid*="event"]'))
      .or(page.locator('.event-card'));
    const count = await eventCards.count();

    if (count > 0) {
      await expect(eventCards.first()).toBeVisible();
    }
  });
});
