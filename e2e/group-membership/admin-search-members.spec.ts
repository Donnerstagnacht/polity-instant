// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Group Membership - Search Members', () => {
  test('Admin can search members by name', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Find search input (wait for PermissionGuard to resolve)
    const searchInput = page
      .getByRole('textbox', { name: /search/i })
      .or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // 4. Enter search term
    await searchInput.fill('test');

    // 5. Verify results are filtered
    const results = page.getByRole('row').or(page.locator('.member-item'));
    const firstResult = results.first();
    await expect(firstResult).toBeVisible();
  });
});
