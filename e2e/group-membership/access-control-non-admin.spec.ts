// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Access Control', () => {
  test('Non-admin cannot access membership management page', async ({ page }) => {
    // 1. Authenticate as non-admin user
    await loginAsTestUser(page);

    // 2. Try to access memberships management page directly
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Verify access is denied
    const accessDenied = page.locator(
      'text=/access denied|unauthorized|forbidden|not authorized/i'
    );
    await expect(accessDenied).toBeVisible();
  });
});
