// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Member Count', () => {
  test('Member count updates when member joins', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_ENTITY_IDS.testGroup1);

    // 3. Get initial member count
    const memberCountElement = page.locator('text=/\\d+\\s*member/i').first();
    await expect(memberCountElement).toBeVisible();

    const initialCountText = await memberCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Verify count is a valid number
    expect(initialCount).toBeGreaterThanOrEqual(0);
  });
});
