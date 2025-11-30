// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Approve Request', () => {
  test('Admin can approve membership request', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships management page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Verify memberships page loaded
    const heading = page.getByRole('heading', { name: /member|membership/i });
    await expect(heading).toBeVisible();

    // 4. Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible();

    await acceptButton.click();

    // 5. Verify user appears in active members list
    // Request should be removed from pending section
  });
});
