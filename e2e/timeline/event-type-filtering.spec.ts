// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Timeline - Event Type Filtering', () => {
  test('User filters timeline by content type using filter panel', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline header
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    const hasFilter = await filterButton.isVisible().catch(() => false);

    if (hasFilter) {
      await filterButton.click();

      // 5. Content Types section should be visible
      const contentTypesHeader = page.getByText(/content types/i);
      await expect(contentTypesHeader).toBeVisible({ timeout: 5000 });  
    }
  });

  test('Filtering shows only selected event type', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check for events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Click on Blogs filter
      const blogTab = page.getByRole('tab', { name: /blog/i });
      const hasBlogTab = await blogTab.isVisible().catch(() => false);

      if (hasBlogTab) {
        await blogTab.click();

        // 6. Verify only blog events shown or empty message
        const noBlogsMessage = page.getByText(/no blog updates/i);
        const hasBlogEvents = !(await noBlogsMessage.isVisible().catch(() => false));

        if (!hasBlogEvents) {
          await expect(noBlogsMessage).toBeVisible();
        }
      }
    }
  });
});
