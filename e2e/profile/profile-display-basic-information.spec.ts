// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Display Profile Basic Information', async ({ authenticatedPage: page }) => {
    // 1. Use loginAsTestUser(page) to authenticate
    // 2. Verify we're authenticated (fixture lands on /notifications)
    await expect(page).toHaveURL(/\/(notifications)?/);

    // 3. Use navigateToOwnProfile(page) helper
    await navigateToOwnProfile(page);

    // 4. Verify URL matches pattern /user/[a-f0-9-]+
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+/);

    // 5. Verify page heading (h1) is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
