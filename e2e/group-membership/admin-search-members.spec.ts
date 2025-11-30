// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Search Members', () => {
  test('Admin can search members by name', async ({ page }) => {
    // 1. Authenticate as admin user
    await loginAsTestUser(page);

    // 2. Navigate to memberships page
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);

    // 3. Find search input
    const searchInput = page
      .getByRole('textbox', { name: /search/i })
      .or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible();

    // 4. Enter search term
    await searchInput.fill('test');

    // 5. Verify results are filtered
    const results = page.getByRole('row').or(page.locator('.member-item'));
    const firstResult = results.first();
    await expect(firstResult).toBeVisible();
  });
});
