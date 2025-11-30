// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can vote to reject change request', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Collaborator navigates to change requests page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    // 2. Collaborator sees pending change request
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 3. Collaborator reviews proposed changes
    await expect(changeRequest.getByText(/proposed change/i)).toBeVisible();

    // 4. Collaborator clicks "Reject" button
    const rejectButton = changeRequest.getByRole('button', { name: /reject/i });
    await expect(rejectButton).toBeVisible();
    await rejectButton.click();

    // 5. Vote is recorded
    // 6. Vote count updates
    await expect(page.getByText(/vote recorded|voted reject/i)).toBeVisible();
  });
});
