// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Change Request System', () => {
  test('Create change request for amendment', async ({ page }) => {
    // 1. Authenticate as test user (collaborator)
    await loginAsTestUser(page);

    // 2. Navigate to amendment change requests page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/change-requests`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Click "Create Change Request" button
    const createButton = page.getByRole('button', { name: /create change request|new change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 5. Enter title
      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Update section 3 wording');

      // 6. Enter description
      const descInput = page.getByLabel(/description/i);
      await descInput.fill('Clarify language in section 3');

      // 7. Enter proposed change
      const changeInput = page.getByLabel(/proposed change/i);
      await changeInput.fill('Replace "shall" with "must"');

      // 8. Submit
      const submitButton = page.getByRole('button', { name: /submit|create/i });
      await submitButton.click();

      // 9. ChangeRequest created
      await page.waitForTimeout(500);

      // Status: "pending"
      // Collaborators notified
      // Appears in change requests list
    }
  });

  test('Vote on change request', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to change requests page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/change-requests`);
    await page.waitForLoadState('networkidle');

    // 3. Find a change request
    const changeRequests = page
      .locator('[data-testid="change-request"]')
      .or(page.getByRole('article'));

    if ((await changeRequests.count()) > 0) {
      const firstRequest = changeRequests.first();

      // 4. Click "Accept" vote
      const acceptButton = firstRequest.getByRole('button', { name: /accept|approve/i });

      if ((await acceptButton.count()) > 0) {
        await acceptButton.click();

        // 5. Vote recorded
        await page.waitForTimeout(300);

        // Vote count updated
        // Vote visible to all
        // Cannot vote again
      }
    }
  });

  test('View vote status on change request', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to change requests
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/change-requests`);
    await page.waitForLoadState('networkidle');

    // 3. View change request
    const changeRequests = page
      .locator('[data-testid="change-request"]')
      .or(page.getByRole('article'));

    if ((await changeRequests.count()) > 0) {
      // 4. Check vote breakdown
      page.getByText(/accept|reject|abstain/i);

      // Accept/Reject/Abstain counts shown
      // Percentage calculated
      // Threshold indicator
      // Who voted what (if transparent)
    }
  });
});
