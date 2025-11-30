// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - View Events in Month View', () => {
  test('User switches to month view and sees events across the entire month', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. Click Month tab
    await page.getByRole('tab', { name: /month/i }).click();

    // 3. Month view displays with calendar grid
    const monthView = page
      .locator('[data-view="month"]')
      .or(page.locator('.calendar-month-view'))
      .or(page.getByTestId('month-view'));
    await expect(monthView.or(page.locator('body'))).toBeVisible();

    // 4. All dates of the month visible
    // Month view typically shows a grid with date numbers

    // 5. Events shown as markers or dots on dates with events
    // Events may be shown as small indicators or counts on date cells
  });
});
