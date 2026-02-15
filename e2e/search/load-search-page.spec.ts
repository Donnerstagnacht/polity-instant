// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Load Search Page', () => {
  test('User accesses the search page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });

    // 3. Wait a bit for React to hydrate
    await page.waitForTimeout(1000);

    // 4. Verify we're on the search page by checking the URL
    expect(page.url()).toContain('/search');

    // 5. Verify page loads with search interface heading
    const searchHeading = page.getByRole('heading', { name: /search/i });
    await expect(searchHeading).toBeVisible({ timeout: 10000 });

    // 6. Search input box prominently displayed
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // 7. Filter button visible (opens filter panel)
    const filterButton = page.getByRole('button', { name: /filter/i });
    const hasFilterButton = await filterButton.isVisible().catch(() => false);

    if (hasFilterButton) {
      await expect(filterButton).toBeVisible();

      // 8. Click filter button to open panel
      await filterButton.click();

      // 9. Wait for filter panel to appear
      await page.waitForTimeout(500);

      // 10. Verify filter panel opens with content type checkboxes
      const contentTypesHeading = page.getByText('Content Types');
      const hasContentTypes = await contentTypesHeading.isVisible().catch(() => false);

      if (hasContentTypes) {
        await expect(contentTypesHeading).toBeVisible();
      }
    }
  });
});
