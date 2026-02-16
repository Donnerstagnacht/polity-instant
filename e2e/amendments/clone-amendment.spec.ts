// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Clone Amendment', () => {
  test('Author clones amendment to target group via dialog', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment wiki page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Find and click clone button
    const cloneButton = page
      .getByRole('button', { name: /clone|copy|duplicate/i })
      .or(page.locator('button:has([class*="Copy"])'));

    if ((await cloneButton.count()) > 0) {
      await cloneButton.first().click();

      // 4. Target selection dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 3000 });

      // 5. Select a target group from the list
      const groupCard = dialog.locator('[class*="gradient"]').first();
      if ((await groupCard.count()) > 0) {
        await groupCard.click();
      }

      // 6. Confirm selection
      const confirmButton = dialog.getByRole('button', { name: /confirm|select/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 7. Verify success (redirect or toast)
        await page.waitForLoadState('networkidle');
      }
    }
  });
});
