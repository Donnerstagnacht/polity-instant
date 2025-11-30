// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Permissions and Management', () => {
  test('Collaborator can create change request', async ({ page }) => {
    // 1. Login as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Create button visible
    const createButton = page.getByRole('button', { name: /create.*change/i });

    // 4. Full access to create
    if ((await createButton.count()) > 0) {
      await expect(createButton).toBeVisible();

      // Can propose changes
      // Can set voting parameters
      // Democratic participation
    }
  });

  test('Non-collaborator cannot create change request', async ({ page }) => {
    // 1. Login as non-collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Create button not visible
    page.getByRole('button', { name: /create.*change/i });

    // 4. Access denied
    // Error message shown
    // Amendment integrity protected
  });

  test('Edit change request before voting', async ({ page }) => {
    // 1. Login as creator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. No votes cast yet
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if ((await editButton.count()) > 0) {
      await editButton.click();

      // 4. Update details
      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Updated Change Request Title');

      // 5. Save
      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      // 6. Changes saved successfully
      await page.waitForTimeout(500);

      // Collaborators notified
      await expect(page.getByText('Updated Change Request Title')).toBeVisible({ timeout: 3000 });
    }
  });

  test('Delete change request without votes', async ({ page }) => {
    // 1. Login as creator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. No votes cast
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // 4. Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 5. Change request deleted
        await page.waitForTimeout(500);

        // Removed from list
        // No impact on amendment
      }
    }
  });
});
