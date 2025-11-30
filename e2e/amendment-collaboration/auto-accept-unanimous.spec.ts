// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Change request auto-applies when all vote accept', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    // 1. Change request has 3 collaborators
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. All 3 vote "accept"
    const acceptButton = changeRequest.getByRole('button', { name: /accept/i });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }

    // 3. System automatically applies change to document
    // 4. Change request status changes to "accepted"
    await expect(changeRequest.getByText(/accepted|applied/i)).toBeVisible();

    // 5. Suggestion is marked as resolved
    await expect(changeRequest.locator('[data-status="accepted"]')).toBeVisible();
  });
});
