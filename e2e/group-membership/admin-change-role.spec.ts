// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Change Role', () => {
  test('Admin can change member role', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find role dropdown for a member
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible();

    // 4. Click role dropdown
    await roleDropdown.click();

    // 5. Select new role
    const roleOption = page.getByRole('option', { name: /moderator|member/i }).first();
    await roleOption.click();

    // 6. Verify role is updated
    await expect(roleDropdown).toContainText(/moderator|member/i);
  });
});
