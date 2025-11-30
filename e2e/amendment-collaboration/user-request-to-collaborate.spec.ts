// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can request to collaborate on amendment', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. User navigates to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    // 2. User clicks "Request to Collaborate" button
    const requestButton = page.getByRole('button', { name: /request to collaborate/i });
    await expect(requestButton).toBeVisible();
    await requestButton.click();

    // 3. Request is created with status "requested"
    // 4. Button changes to "Request Pending"
    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();
    await expect(requestButton).not.toBeVisible();
  });
});
