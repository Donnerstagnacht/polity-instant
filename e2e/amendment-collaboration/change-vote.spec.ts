// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can change vote on change request', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    // 1. Collaborator has already voted
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();
    await expect(changeRequest.getByText(/you voted/i)).toBeVisible();

    // 2. Collaborator navigates to change request
    // 3. Collaborator clicks different vote option
    const rejectButton = changeRequest.getByRole('button', { name: /reject/i });
    await rejectButton.click();

    // 4. Confirm dialog appears
    // 5. Collaborator confirms vote change
    const confirmDialog = page.getByRole('dialog');
    if (await confirmDialog.isVisible()) {
      const confirmButton = confirmDialog.getByRole('button', { name: /confirm/i });
      await confirmButton.click();
    }

    // 6. Vote is updated
    await expect(page.getByText(/vote updated|changed to reject/i)).toBeVisible();
  });
});
