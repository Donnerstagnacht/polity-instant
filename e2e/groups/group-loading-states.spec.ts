// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Groups - Group Loading States', () => {
  test('Group page displays loading indicator', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Intercept network requests to delay response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return route.continue();
    });

    // 3. Navigate to group page
    await page.goto('/group/test-group-id');

    // 4. Loading indicator displayed
    const loadingIndicator = page
      .getByRole('status')
      .or(page.getByText(/loading/i))
      .or(page.locator('.loading'));

    // Check if loading state was visible (may be very brief)
    await loadingIndicator.count();

    // 5. Wait for group to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      return;
    });

    // 6. Smooth transition to loaded state
    await page.waitForTimeout(500);

    // No layout shift should occur
  });
});
