// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Navigation and URL Handling', () => {
  test('Direct URL Access to Own Profile', async ({ authenticatedPage: page }) => {
    // 1. Authenticate using loginAsTestUser(page)
    // 2. Use page.goto('/user') to navigate
    await page.goto('/user');

    // 3. Verify automatic redirect occurs
    // 4. Wait for URL matching pattern /user/[a-f0-9-]+
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+/, { timeout: 5000 });

    // 5. Verify redirect completes within 5 seconds (already waited above)

    // 6. Verify profile page content loads
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
