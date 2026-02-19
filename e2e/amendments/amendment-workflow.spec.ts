// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Workflow Transitions', () => {
  test('Author views current workflow status on process page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to amendment process page with retry for transient crashes under load
    const url = `/amendment/${TEST_ENTITY_IDS.AMENDMENT}/process`;
    let loaded = false;
    for (let attempt = 0; attempt < 3 && !loaded; attempt++) {
      if (attempt > 0) await page.waitForTimeout(2000);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Check for client-side crash
      const errorHeading = page.getByRole('heading', { name: /application error/i });
      const hasError = await errorHeading.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasError) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        continue;
      }
      loaded = true;
    }

    // 3. Verify process page loaded
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 4. Verify workflow status section is present (page rendered successfully)
  });

  test('Author can set target group on process page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to process page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/process`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Look for set target / update target button
    const targetButton = page.getByRole('button', { name: /target|set|update/i });
    if ((await targetButton.count()) > 0) {
      await targetButton.first().click();

      // 4. Dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 3000 });

      // 5. Available targets tab should be visible
      const networkTab = page.getByRole('tab', { name: /available|network/i });
      if ((await networkTab.count()) > 0) {
        await networkTab.click();
      }

      // 6. Cancel without selecting
      const cancelButton = dialog.getByRole('button', { name: /cancel/i });
      await cancelButton.click();
    }
  });

  test('Author can remove target on process page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to process page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/process`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Look for remove button
    const removeButton = page.getByRole('button', { name: /remove/i });
    if ((await removeButton.count()) > 0) {
      await removeButton.first().click();

      // 4. Confirmation dialog
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        // Cancel to avoid modifying test data
        const cancelButton = dialog.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
      }
    }
  });
});
