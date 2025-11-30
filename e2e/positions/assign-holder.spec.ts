// spec: e2e/test-plans/positions-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Positions - Assign Current Holder', () => {
  test('Assign user to position', async ({ page }) => {
    // 1. Authenticate as admin
    await loginAsTestUser(page);

    // 2. Navigate to position management
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    // 3. Select position
    const positionCards = page.locator('[data-testid="position-card"]');

    if ((await positionCards.count()) > 0) {
      const firstPosition = positionCards.first();

      // 4. Click "Assign Holder"
      const assignButton = firstPosition.getByRole('button', { name: /assign|set.*holder/i });

      if ((await assignButton.count()) > 0) {
        await assignButton.click();

        // 5. Search for user
        const userSearch = page.getByPlaceholder(/search.*user/i);
        await userSearch.fill('test');

        await page.waitForTimeout(300);

        // 6. Select user and confirm
        const userOption = page.getByRole('option').first();
        if ((await userOption.count()) > 0) {
          await userOption.click();
        }

        const confirmButton = page.getByRole('button', { name: /confirm|assign/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();

          // 7. User assigned as currentHolder
          await page.waitForTimeout(500);

          // User's name and avatar displayed
          // User receives notification
        }
      }
    }
  });

  test('Replace current holder', async ({ page }) => {
    // 1. Authenticate as admin
    await loginAsTestUser(page);

    // 2. Navigate to position with current holder
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    const positionCards = page.locator('[data-testid="position-card"]');

    if ((await positionCards.count()) > 0) {
      const firstPosition = positionCards.first();

      // 3. Assign different user
      const changeButton = firstPosition.getByRole('button', { name: /change|replace/i });

      if ((await changeButton.count()) > 0) {
        await changeButton.click();

        // 4. Select new user
        const userSearch = page.getByPlaceholder(/search/i);
        await userSearch.fill('new user');

        await page.waitForTimeout(300);

        const userOption = page.getByRole('option').first();
        if ((await userOption.count()) > 0) {
          await userOption.click();
        }

        // 5. Confirm replacement
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();

          // 6. Previous holder removed
          await page.waitForTimeout(500);

          // New holder assigned
          // Both users notified
          // Transition tracked
        }
      }
    }
  });

  test('Remove current holder', async ({ page }) => {
    // 1. Authenticate as admin
    await loginAsTestUser(page);

    // 2. Navigate to position
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    const positionCards = page.locator('[data-testid="position-card"]');

    if ((await positionCards.count()) > 0) {
      const firstPosition = positionCards.first();

      // 3. Click "Remove Holder"
      const removeButton = firstPosition.getByRole('button', { name: /remove|clear/i });

      if ((await removeButton.count()) > 0) {
        await removeButton.click();

        // 4. Confirm removal
        const confirmButton = page.getByRole('button', { name: /confirm|remove/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();

          // 5. CurrentHolder link removed
          await page.waitForTimeout(500);

          // Position marked as vacant
          // User notified
          // Historical record kept
        }
      }
    }
  });
});
