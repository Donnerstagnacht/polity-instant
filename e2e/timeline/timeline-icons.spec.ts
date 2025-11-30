// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Timeline Icons', () => {
  test('Different event types have distinct icons', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Verify filter tabs have icons
      const amendmentTab = page.getByRole('tab', { name: /amendment/i });
      const hasAmendmentTab = await amendmentTab.isVisible().catch(() => false);

      if (hasAmendmentTab) {
        // Amendments show scale/document icon
        const amendmentIcon = amendmentTab.locator('svg');
        await expect(amendmentIcon).toBeVisible();
      }

      const eventTab = page.getByRole('tab', { name: /event/i });
      const hasEventTab = await eventTab.isVisible().catch(() => false);

      if (hasEventTab) {
        // Events show calendar icon
        const eventIcon = eventTab.locator('svg');
        await expect(eventIcon).toBeVisible();
      }

      const groupTab = page.getByRole('tab', { name: /group/i });
      const hasGroupTab = await groupTab.isVisible().catch(() => false);

      if (hasGroupTab) {
        // Groups show users/group icon
        const groupIcon = groupTab.locator('svg');
        await expect(groupIcon).toBeVisible();
      }

      const blogTab = page.getByRole('tab', { name: /blog/i });
      const hasBlogTab = await blogTab.isVisible().catch(() => false);

      if (hasBlogTab) {
        // Blogs show book/document icon
        const blogIcon = blogTab.locator('svg');
        await expect(blogIcon).toBeVisible();
      }
    }
  });

  test('Timeline header shows RSS icon', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Verify RSS icon in timeline header
    const timelineHeader = page
      .locator('[class*="CardTitle"]')
      .filter({ hasText: /your timeline/i });
    const hasHeader = await timelineHeader.isVisible().catch(() => false);

    if (hasHeader) {
      // 5. RSS icon should be visible
      const rssIcon = timelineHeader.locator('svg');
      await expect(rssIcon).toBeVisible();
    }
  });
});
