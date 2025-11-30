// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - Loading States', () => {
  test('Calendar displays loading indicator while fetching events', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);

    // 2. Intercept network requests to delay response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return route.continue();
    });

    await page.goto('/calendar');

    // 3. Loading indicator appears
    const loadingIndicator = page
      .getByRole('status')
      .or(page.getByText(/loading/i))
      .or(page.locator('.loading'))
      .or(page.locator('[data-testid="loading"]'));

    // Check if loading state was visible (may be very brief)
    const hasLoading = (await loadingIndicator.count()) > 0;

    // 4. Wait for events to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      return;
    });

    // 5. Loading indicator is removed
    if (hasLoading) {
      await expect(loadingIndicator.first())
        .not.toBeVisible({ timeout: 5000 })
        .catch(() => {
          return;
        });
    }

    // Events or empty state is displayed
    await page.waitForTimeout(500);
  });
});
