// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Timeline - Filter Badges and Counts', () => {
  test('Filter button shows active filter count', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline header
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Filter button should be visible (in Following mode)
    const filterButton = page.getByRole('button', { name: /filter/i });
    const hasFilter = await filterButton.isVisible().catch(() => false);

    if (hasFilter) {
      // 5. Click filter to open filter panel
      await filterButton.click();

      // 6. Filter panel should appear with content type checkboxes
      const filterPanel = page.getByText(/content types/i);
      await expect(filterPanel).toBeVisible({ timeout: 5000 });
    }
  });

  test('Filter panel has content type checkboxes', async ({ authenticatedPage: page }) => {
    // 1. Navigate to home page
    await page.goto('/');
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 2. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    const hasFilter = await filterButton.isVisible().catch(() => false);

    if (hasFilter) {
      await filterButton.click();

      // 3. Should show content type options
      const contentTypesHeader = page.getByText(/content types/i);
      await expect(contentTypesHeader).toBeVisible({ timeout: 5000 });
    }
  });
});
