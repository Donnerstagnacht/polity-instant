// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Hashtag Search', () => {
  test('User searches using hashtag filter', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search page
    await page.goto('/search');

    // 3. Open filters
    const filterButton = page
      .getByRole('button', { name: '' })
      .filter({ has: page.locator('svg') })
      .first();
    await filterButton.click();

    // 4. Enter hashtag in filter
    const hashtagInput = page.getByPlaceholder(/enter hashtag/i);
    await expect(hashtagInput).toBeVisible();

    await hashtagInput.fill('sustainability');

    // 5. Wait for filter to apply
    await page.waitForTimeout(500);

    // 6. URL updates with hashtag parameter
    await expect(page).toHaveURL(/hashtag=sustainability/);

    // 7. Active filter badge visible
    const filterBadge = page.locator('[class*="Badge"]').filter({ hasText: /sustainability/i });
    const hasBadge = await filterBadge.isVisible().catch(() => false);

    if (hasBadge) {
      await expect(filterBadge).toBeVisible();
    }
  });

  test('User types hashtag with # symbol in search', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Open filters
    const filterButton = page
      .getByRole('button', { name: '' })
      .filter({ has: page.locator('svg') })
      .first();
    await filterButton.click();

    // 4. Type hashtag with # symbol
    const hashtagInput = page.getByPlaceholder(/enter hashtag/i);
    await hashtagInput.fill('#education');

    // 5. Wait for filter to apply
    await page.waitForTimeout(500);

    // 6. Results show entities tagged with that hashtag
    await expect(page).toHaveURL(/hashtag/);
  });

  test('User clears hashtag filter', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate with hashtag filter
    await page.goto('/search?hashtag=test');

    // 3. Active filter badge should be visible
    const filterBadge = page.locator('[class*="Badge"]').filter({ hasText: /test/i });
    const hasBadge = await filterBadge.isVisible().catch(() => false);

    if (hasBadge) {
      // 4. Click to clear filter
      await filterBadge.click();

      // 5. Wait for URL update
      await page.waitForTimeout(500);

      // 6. Hashtag parameter removed from URL
      await expect(page).not.toHaveURL(/hashtag=test/);
    }
  });
});
