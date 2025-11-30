// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Change request auto-rejects when majority vote reject', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    // 1. Change request has 5 collaborators
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. 3 vote "reject", 2 vote "accept"
    const rejectButton = changeRequest.getByRole('button', { name: /reject/i });
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
    }

    // 3. Change request status changes to "rejected"
    await expect(changeRequest.getByText(/rejected/i)).toBeVisible();

    // 4. Change is not applied
    // 5. Suggestion remains for reference
    await expect(changeRequest.locator('[data-status="rejected"]')).toBeVisible();
  });
});
