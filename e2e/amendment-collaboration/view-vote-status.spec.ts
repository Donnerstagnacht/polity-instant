// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can view change request vote status', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. User navigates to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/change-requests`);

    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. Vote status is displayed
    await expect(changeRequest.getByText(/vote status|voting progress/i)).toBeVisible();

    // 3. Shows who has voted (accept/reject/abstain)
    await expect(changeRequest.locator('.vote-count, [data-vote-count]')).toBeVisible();

    // 4. Shows who hasn't voted yet
    await expect(changeRequest.getByText(/pending votes|waiting for/i)).toBeVisible();

    // 5. Progress bar or count is visible
    await expect(changeRequest.locator('.progress, [role="progressbar"]')).toBeVisible();
  });
});
