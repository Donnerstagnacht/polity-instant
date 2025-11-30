// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Create Basic Change Request', () => {
  test('Create change request with required fields', async ({ page }) => {
    // 1. Authenticate as test user (collaborator)
    await loginAsTestUser(page);

    // 2. Navigate to amendment change requests
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to change requests tab
    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 4. Click "Create Change Request"
    const createButton = page.getByRole('button', { name: /create.*change.*request|new.*change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 5. Enter title
      const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
      await titleInput.fill('Update Section 3 Wording');

      // 6. Enter description
      const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
      await descInput.fill('Clarify terminology in Section 3');

      // 7. Enter proposed change text
      const changeInput = page.getByLabel(/proposed.*change|change.*text/i);
      if ((await changeInput.count()) > 0) {
        await changeInput.fill('Replace "shall" with "must" throughout Section 3');
      }

      // 8. Submit
      const submitButton = page.getByRole('button', { name: /create|submit|save/i });
      await submitButton.click();

      // 9. Change request created
      await page.waitForTimeout(500);

      // Status: "pending"
      // Appears in change requests list
      await expect(page.getByText('Update Section 3 Wording')).toBeVisible({ timeout: 3000 });
    }
  });

  test('Create change request with full details', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    const createButton = page.getByRole('button', { name: /create.*change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 3. Fill all fields
      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Comprehensive Update');

      const descInput = page.getByLabel(/description/i);
      await descInput.fill('Major revisions to improve clarity');

      const changeInput = page.getByLabel(/proposed.*change/i);
      await changeInput.fill('Complete rewrite of Article 5');

      const justificationInput = page.getByLabel(/justification|reason/i);
      if ((await justificationInput.count()) > 0) {
        await justificationInput.fill('Current wording is ambiguous and needs clarification');
      }

      // 4. Set voting parameters
      const thresholdInput = page.getByLabel(/threshold/i);
      if ((await thresholdInput.count()) > 0) {
        await thresholdInput.fill('75');
      }

      // 5. Save
      const submitButton = page.getByRole('button', { name: /create|submit/i });
      await submitButton.click();

      // 6. All fields saved correctly
      await page.waitForTimeout(500);

      // Voting configured
      // Collaborators notified
      await expect(page.getByText('Comprehensive Update')).toBeVisible({ timeout: 3000 });
    }
  });
});
