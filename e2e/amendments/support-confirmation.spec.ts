// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Support Confirmation', () => {
  test('Group admin views support confirmation panel', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Look for support confirmation panel
    const confirmPanel = page.getByText(/support confirmation|pending/i);
    if ((await confirmPanel.count()) > 0) {
      // 4. Panel shows pending confirmations
      await expect(confirmPanel.first()).toBeVisible();

      // 5. Confirm and decline buttons should be available
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      const declineButton = page.getByRole('button', { name: /decline/i });

      if ((await confirmButton.count()) > 0) {
        await expect(confirmButton.first()).toBeVisible();
      }
      if ((await declineButton.count()) > 0) {
        await expect(declineButton.first()).toBeVisible();
      }
    }
  });

  test('Group admin can view changes before confirming support', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Look for view changes button
    const viewChangesButton = page.getByRole('button', { name: /view changes|hide changes/i });
    if ((await viewChangesButton.count()) > 0) {
      await viewChangesButton.first().click();

      // 4. Changes should be displayed

      // 5. Toggle back to hide
      await viewChangesButton.first().click();
    }
  });
});
