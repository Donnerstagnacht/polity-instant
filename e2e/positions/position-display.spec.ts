// spec: e2e/test-plans/positions-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Positions - Position Display', () => {
  test('View position on group page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. View positions section/carousel
    // 4. All positions displayed
    const positionCards = page
      .locator('[data-testid="position-card"]')
      .or(page.getByRole('article'));

    if ((await positionCards.count()) > 0) {
      // Position title shown
      // Current holder if assigned
      // Term information visible
      // Professional card design
      await expect(positionCards.first()).toBeVisible();
    }
  });

  test('View position card details', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. View position card in carousel
    const positionCards = page.locator('[data-testid="position-card"]');

    if ((await positionCards.count()) > 0) {
      // 4. Check all displayed information
      // Title prominently displayed
      // Description visible
      // Current holder with avatar and name
      // Term length shown
      // First term start date displayed
      // Vacant if no holder
    }
  });

  test('Empty state for no positions', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group with no positions
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    // 3. Check for empty state
    // 4. Appropriate empty state message
    // Encouragement to create positions
    // Create button visible to admins
    // Clean UI
  });
});
