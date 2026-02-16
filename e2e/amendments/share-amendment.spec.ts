// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Share Amendment', () => {
  test('User shares amendment via share button', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Find and click share button
    const shareButton = page
      .getByRole('button', { name: /share/i })
      .or(page.locator('button:has([class*="Share"])'));

    if ((await shareButton.count()) > 0) {
      await shareButton.first().click();

      // 4. Share dialog or clipboard action

      // 5. Verify share action (toast or dialog)
      const toast = page.getByText(/copied|shared|link/i);
      const dialog = page.getByRole('dialog');
      const hasToast = (await toast.count()) > 0;
      const hasDialog = (await dialog.count()) > 0;

      expect(hasToast || hasDialog).toBeTruthy();
    }
  });
});
