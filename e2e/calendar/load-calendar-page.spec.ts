// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Calendar - Load Calendar Page', () => {
  test('User accesses the calendar page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to /calendar
    await page.goto('/calendar');

    // 3. Page loads with default day view
    await expect(page.getByRole('heading', { name: /calendar/i }).first()).toBeVisible();

    // 4. Current date selected
    const todayButton = page.getByRole('button', { name: 'Today', exact: true });
    await expect(todayButton).toBeVisible();

    // 5. View mode toggle buttons visible
    await expect(page.getByRole('tab', { name: /day/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /week/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /month/i })).toBeVisible();
  });
});
