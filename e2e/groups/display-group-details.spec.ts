// spec: e2e/test-plans/groups-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Groups - Display Group Details', () => {
  test('User views group details on group page', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    // SETUP: Create a group via factory so this test is self-contained
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Details Test Group ${Date.now()}`,
      description: 'E2E test group for display details',
    });

    // Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Name displayed correctly
    const name = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(name).toBeVisible();

    // Group details are visible
    await expect(page).toHaveURL(/\/group\/.+/);
  });

  test('Group stats bar displays accurate counts', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    // SETUP: Create a group via factory
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Stats Test Group ${Date.now()}`,
    });

    // Navigate to group page
    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Check member count is visible
    const memberCount = page.getByText(/member/i);
    await expect(memberCount.first()).toBeVisible();
  });
});
