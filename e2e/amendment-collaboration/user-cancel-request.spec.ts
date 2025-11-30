// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can cancel pending collaboration request', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    // 1. User has pending request
    const requestPendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(requestPendingButton).toBeVisible();

    // 2. User clicks "Request Pending" button
    await requestPendingButton.click();

    // 3. Request is deleted
    // 4. Button changes back to "Request to Collaborate"
    await expect(page.getByRole('button', { name: /request to collaborate/i })).toBeVisible();
    await expect(requestPendingButton).not.toBeVisible();
  });
});
