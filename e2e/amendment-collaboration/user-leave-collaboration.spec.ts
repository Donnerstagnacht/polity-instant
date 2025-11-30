// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can leave amendment', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment3}`);

    // 1. User is a collaborator of amendment
    const leaveButton = page.getByRole('button', { name: /leave collaboration/i });
    await expect(leaveButton).toBeVisible();

    // 2. User clicks "Leave Collaboration" button
    await leaveButton.click();

    // 3. Collaboration is deleted
    // 4. Button changes to "Request to Collaborate"
    await expect(page.getByRole('button', { name: /request to collaborate/i })).toBeVisible();
    await expect(leaveButton).not.toBeVisible();
  });
});
