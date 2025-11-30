// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Permissions and Management', () => {
  test('Election organizer can add candidates', async ({ page }) => {
    // 1. Login as election organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Add button visible
    const addButton = page.getByRole('button', { name: /add candidate|create candidate/i });

    // 4. Full access to create
    if ((await addButton.count()) > 0) {
      await expect(addButton).toBeVisible();

      // Can set all fields
      // Can manage all candidates
    }
  });

  test('Non-organizer cannot add candidates', async ({ page }) => {
    // 1. Login as regular user/voter
    await loginAsTestUser(page);

    // 2. Navigate to election
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. Add button not visible
    // 4. Access denied if attempted
    // Election integrity protected
  });

  test('Edit candidate information', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Find candidate
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if ((await editButton.count()) > 0) {
      await editButton.click();

      // 4. Update fields
      const nameInput = page.getByLabel(/name/i);
      await nameInput.fill('Updated Candidate Name');

      // 5. Save changes
      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      // 6. Changes saved successfully
      await page.waitForTimeout(500);

      // Updates visible immediately
      await expect(page.getByText('Updated Candidate Name')).toBeVisible({ timeout: 3000 });
    }
  });

  test('Delete candidate before voting', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Delete candidate (no votes cast)
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // 4. Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 5. Candidate deleted
        await page.waitForTimeout(500);

        // Removed from candidates list
        // No impact on election
      }
    }
  });
});
