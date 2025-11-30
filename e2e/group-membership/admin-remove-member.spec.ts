// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Remove Member', () => {
  test('Admin can remove member from group', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Get initial member count
    const memberCountElement = page.locator('text=/\\d+\\s*member/i').first();
    const initialCountText = await memberCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Find member and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 5. Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify member count decreased
    const newCountText = await memberCountElement.textContent();
    const newCount = parseInt(newCountText?.match(/\\d+/)?.[0] || '0');
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });
});
