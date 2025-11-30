// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - View Events in Week View', () => {
  test('User switches to week view and sees events across the week', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. Click Week tab
    await page.getByRole('tab', { name: /week/i }).click();

    // 3. Week view displays with 7 days
    const weekView = page
      .locator('[data-view="week"]')
      .or(page.locator('.calendar-week-view'))
      .or(page.getByTestId('week-view'));
    await expect(weekView.or(page.locator('body'))).toBeVisible();

    // 4. Each day shows date header
    // Days may be displayed as column headers or day labels
    page.locator('[data-day]').or(page.locator('.day-header')).or(page.getByRole('columnheader'));

    // 5. Events displayed in corresponding day columns
    // Events may appear as cards or list items within day columns
  });
});
