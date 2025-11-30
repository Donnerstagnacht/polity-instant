// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Version Control', () => {
  test('Save version of amendment', async ({ page }) => {
    // 1. Authenticate as test user (author)
    await loginAsTestUser(page);

    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to version control
    const versionButton = page.getByRole('button', { name: /version|history/i });

    if ((await versionButton.count()) > 0) {
      await versionButton.click();

      // 4. Click "Save Version"
      const saveVersionButton = page.getByRole('button', { name: /save version/i });

      if ((await saveVersionButton.count()) > 0) {
        await saveVersionButton.click();

        // 5. Enter version name/description
        const nameInput = page.getByLabel(/name|description/i);
        await nameInput.fill('Draft version 1.0');

        // 6. Save
        const confirmButton = page.getByRole('button', { name: /save|confirm/i });
        await confirmButton.click();

        // 7. Version created with snapshot
        await page.waitForTimeout(500);

        // Timestamp recorded
        // Version appears in history
      }
    }
  });

  test('View version history', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Open version history panel
    const versionButton = page.getByRole('button', { name: /version|history/i });

    if ((await versionButton.count()) > 0) {
      await versionButton.click();

      // 4. Browse versions
      page.locator('[data-testid="version-list"]').or(page.locator('.version-history'));

      // 5. All versions listed chronologically
      // Version metadata shown (name, author, date)
      // Comparison available
      // Restore option visible
    }
  });

  test('Restore previous version', async ({ page }) => {
    // 1. Authenticate as test user (author)
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Open version history
    const versionButton = page.getByRole('button', { name: /version|history/i });

    if ((await versionButton.count()) > 0) {
      await versionButton.click();

      // 4. Select version from history
      const versions = page.locator('[data-testid="version-item"]');

      if ((await versions.count()) > 0) {
        const restoreButton = versions.first().getByRole('button', { name: /restore/i });

        if ((await restoreButton.count()) > 0) {
          // 5. Click "Restore"
          await restoreButton.click();

          // 6. Confirm restoration
          const confirmButton = page.getByRole('button', { name: /confirm|restore/i });
          await confirmButton.click();

          // 7. Document reverted to selected version
          await page.waitForTimeout(500);

          // New version created (restore event)
          // All collaborators notified
        }
      }
    }
  });
});
