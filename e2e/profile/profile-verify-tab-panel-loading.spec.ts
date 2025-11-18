// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('Responsive Behavior and Visual Elements', () => {
  test('Verify Tab Panel Content Loading', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Wait for tablist to be visible
    // Using the Blogs/Groups/Amendments tablist (there are multiple tablists on the page)
    const tablist = page.locator('[role="tablist"]').last();
    await expect(tablist).toBeVisible({ timeout: 10000 });

    // 3. Get first tab element
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Test at least 2 additional tabs (minimum 3 total if available)
    const tabsToTest = Math.min(3, tabCount);

    for (let i = 0; i < tabsToTest; i++) {
      const tab = tabs.nth(i);

      // 4/7. Click tab
      await tab.click();

      // 5. Wait for tab panel to appear
      // Filter for visible panel since there are multiple panels (some hidden)
      const tabPanel = page.locator('[role="tabpanel"]:visible');
      await expect(tabPanel.first()).toBeVisible({ timeout: 5000 });

      // 6. Verify tab panel contains content or empty state message
      const panelContent = await tabPanel.first().textContent();
      expect(panelContent).toBeTruthy();

      console.log(`Tab ${i + 1} panel loaded with content`);
    }
  });
});
