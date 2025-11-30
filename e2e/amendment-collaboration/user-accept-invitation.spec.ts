// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can accept collaboration invitation', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. User is invited to amendment (status: "invited")
    // 2. User navigates to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment2}`);

    // 3. User sees "Accept Invitation" button
    const acceptButton = page.getByRole('button', { name: /accept invitation/i });
    await expect(acceptButton).toBeVisible();

    // 4. User clicks button
    await acceptButton.click();

    // 5. Status changes to "member"
    // 6. Button changes to "Leave Collaboration"
    await expect(page.getByRole('button', { name: /leave collaboration/i })).toBeVisible();
    await expect(acceptButton).not.toBeVisible();
  });
});
