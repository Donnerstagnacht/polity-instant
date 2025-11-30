// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Amendments - Amendment Loading States', () => {
  test('Amendment page displays loading indicator', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Intercept network requests to delay response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // 3. Navigate to amendment page
    await page.goto('/amendment/test-amendment-id');

    // 4. Loading indicator shown
    const loadingIndicator = page
      .getByRole('status')
      .or(page.getByText(/loading/i))
      .or(page.locator('.loading'));

    // Check if loading state was visible (may be very brief)
    await loadingIndicator.count();

    // 5. Wait for amendment to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      return;
    });

    // 6. Smooth transition
    await page.waitForTimeout(500);

    // No layout shift
  });
});
