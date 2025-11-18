// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Display Profile Basic Information', async ({ page }) => {
    // 1. Use loginAsTestUser(page) to authenticate
    await loginAsTestUser(page);

    // 2. Verify redirect to home page at /
    await expect(page).toHaveURL('/');

    // 3. Use navigateToOwnProfile(page) helper
    await navigateToOwnProfile(page);

    // 4. Verify URL matches pattern /user/[a-f0-9-]+
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+/);

    // 5. Verify page heading (h1) is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // 6. Verify avatar image is displayed in main content area
    const avatar = page.locator('main img').first();
    await expect(avatar).toBeVisible();
  });
});
