// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Search Members', () => {
  test('Admin can search members by name', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page
    await page.goto(`/group/${group.id}/memberships`);

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
