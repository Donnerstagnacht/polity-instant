// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('Navigation and URL Handling', () => {
  test('Navigate to Subscriptions Page', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Locate subscriptions link
    const subscriptionsLink = page.getByRole('link', { name: /subscription/i });
    const linkCount = await subscriptionsLink.count();

    // 3. If link is visible
    if (linkCount > 0 && (await subscriptionsLink.first().isVisible())) {
      // Click the subscriptions link
      await subscriptionsLink.first().click();

      // Verify URL matches /user/[a-f0-9-]+/subscriptions
      await expect(page).toHaveURL(/\/user\/[a-f0-9-]+\/subscriptions/);

      // Verify heading containing "subscription" is visible
      const heading = page.getByRole('heading', { name: /subscription/i });
      await expect(heading).toBeVisible({ timeout: 5000 });
    } else {
      // 4. If link not visible, mark as not applicable for this user
      console.log('Subscriptions link not visible - not applicable for this user');
    }
  });
});
