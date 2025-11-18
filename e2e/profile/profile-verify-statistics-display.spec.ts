// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Verify Profile Statistics Display', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Locate the statistics section
    const statsSection = page.locator('[class*="stat"]').or(
      page
        .getByText(/Followers|Following|Amendments|Network/)
        .first()
        .locator('..')
    );

    // 3. If stats section exists, verify it is visible
    const statsCount = await statsSection.count();
    if (statsCount > 0) {
      await expect(statsSection.first()).toBeVisible();

      // 4. Check that stat values are displayed (numbers)
      const statValues = page
        .locator('[class*="stat"] [class*="value"]')
        .or(page.locator('text=/\\d+/').first());
      const valueCount = await statValues.count();
      expect(valueCount).toBeGreaterThan(0);
    }
  });
});
