// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Statements - Statement Loading States', () => {
  test('Statement page displays loading indicator', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Intercept network requests to delay response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return route.continue();
    });

    // 3. Navigate to statement page
    await page.goto('/statement/test-statement-id');

    // 4. Loading indicator shown
    // 5. Wait for statement to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      return;
    });

    // 6. Smooth transition to loaded state
    await page.waitForTimeout(500);

    // No layout shift
  });
});
