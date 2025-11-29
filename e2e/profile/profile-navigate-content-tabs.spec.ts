// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Navigate Profile Content Tabs', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Wait for tablist element with role="tablist" to be visible
    // Using the Blogs/Groups/Amendments tablist (there are multiple tablists on the page)
    const tablist = page.locator('[role="tablist"]').last();
    await expect(tablist).toBeVisible({ timeout: 10000 });

    // 3. Get count of all tab elements with role="tab"
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    // 4. Verify tab count is greater than 0
    expect(tabCount).toBeGreaterThan(0);

    // 5. For each tab (minimum 3 tabs)
    const tabsToTest = Math.min(3, tabCount);
    for (let i = 0; i < tabsToTest; i++) {
      const tab = tabs.nth(i);

      // Click the tab
      await tab.click();

      // Verify tab has aria-selected="true" attribute
      await expect(tab).toHaveAttribute('aria-selected', 'true');

      // Verify corresponding tab panel with role="tabpanel" is visible
      // Filter for visible panel since there are multiple panels (some hidden)
      const tabPanel = page.locator('[role="tabpanel"]:visible');
      await expect(tabPanel.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
