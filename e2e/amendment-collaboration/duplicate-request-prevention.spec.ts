// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Duplicate collaboration request prevention', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    // 1. User requests to collaborate
    const requestButton = page.getByRole('button', { name: /request to collaborate/i });
    await expect(requestButton).toBeVisible();
    await requestButton.click();

    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();

    // 2. User tries to request again
    // 3. System prevents duplicate request
    const pendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(pendingButton).toBeVisible();

    // Verify only one request by canceling and seeing original button
    await pendingButton.click();
    await expect(requestButton).toBeVisible();

    // Try requesting again
    await requestButton.click();

    // 4. Only one request exists
    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();
    await expect(requestButton).not.toBeVisible();
  });
});
