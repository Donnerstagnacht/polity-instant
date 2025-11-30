// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can abstain from change request vote', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Collaborator navigates to change requests page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    // 2. Collaborator sees pending change request
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 3. Collaborator clicks "Abstain" button
    const abstainButton = changeRequest.getByRole('button', { name: /abstain/i });
    await expect(abstainButton).toBeVisible();
    await abstainButton.click();

    // 4. Vote is recorded
    // 5. Vote count updates
    await expect(page.getByText(/vote recorded|voted abstain/i)).toBeVisible();
  });
});
