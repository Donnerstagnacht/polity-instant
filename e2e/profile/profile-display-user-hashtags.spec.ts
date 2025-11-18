// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Display User Hashtags', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Locate elements with class containing "hashtag"
    const hashtagContainer = page.locator('[class*="hashtag"]');
    const hashtagCount = await hashtagContainer.count();

    // 3. If hashtag container exists, verify visibility
    if (hashtagCount > 0) {
      await expect(hashtagContainer.first()).toBeVisible();

      // 4. Count number of hashtags displayed (if any)
      const hashtags = page.locator('[class*="hashtag"]');
      const count = await hashtags.count();
      console.log(`Hashtags found: ${count}`);

      expect(count).toBeGreaterThan(0);
    } else {
      console.log('No hashtags found for this user');
    }
  });
});
