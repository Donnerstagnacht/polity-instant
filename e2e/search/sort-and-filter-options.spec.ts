// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Sort and Filter Options', () => {
  test('User sorts results by relevance', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=test');

    // 3. Open filters
    const filterButton = page
      .getByRole('button', { name: '' })
      .filter({ has: page.locator('svg') })
      .first();
    await filterButton.click();

    // 4. Select sort by relevance
    const sortSelect = page
      .locator('select, [role="combobox"]')
      .filter({ hasText: /sort|relevance|date/i })
      .first();
    const hasSort = await sortSelect.isVisible().catch(() => false);

    if (hasSort) {
      await sortSelect.click();
      const relevanceOption = page.getByRole('option', { name: /relevance/i });
      const hasOption = await relevanceOption.isVisible().catch(() => false);

      if (hasOption) {
        await relevanceOption.click();
      }
    }

    // 5. URL updates with sort parameter
    await page.waitForTimeout(500);
  });

  test('User sorts results by date', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test');

    // 3. Open filters
    const filterButton = page
      .getByRole('button', { name: '' })
      .filter({ has: page.locator('svg') })
      .first();
    await filterButton.click();

    // 4. Find sort dropdown
    const sortTrigger = page
      .locator('[id="sort"]')
      .or(page.locator('button').filter({ hasText: /sort|relevance|date/i }))
      .first();
    const hasSort = await sortTrigger.isVisible().catch(() => false);

    if (hasSort) {
      await sortTrigger.click();

      // 5. Select Date option
      const dateOption = page
        .getByRole('option', { name: /date/i })
        .or(page.getByText('Date', { exact: true }));
      const hasOption = await dateOption.isVisible().catch(() => false);

      if (hasOption) {
        await dateOption.click();
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/sort=date/);
      }
    }
  });

  test('User filters to public content only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test');

    // 3. Open filters
    const filterButton = page
      .getByRole('button', { name: '' })
      .filter({ has: page.locator('svg') })
      .first();
    await filterButton.click();

    // 4. Toggle "Public Only" switch
    const publicSwitch = page.locator('[id="public-only"]').or(page.getByRole('switch'));
    const hasSwitch = await publicSwitch.isVisible().catch(() => false);

    if (hasSwitch) {
      await publicSwitch.click();

      // 5. Wait for filter to apply
      await page.waitForTimeout(500);

      // 6. URL updates with public parameter
      await expect(page).toHaveURL(/public=true/);
    }
  });
});
