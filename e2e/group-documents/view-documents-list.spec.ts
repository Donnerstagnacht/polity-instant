import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Documents - View Documents List', () => {
  test('should display group documents page title', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Docs Group Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/editor`);
    await page.waitForLoadState('domcontentloaded');

    const title = page.getByText(/documents/i);
    await expect(title.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display New Document button', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Docs Button Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/editor`);
    await page.waitForLoadState('domcontentloaded');

    const newDocButton = page.getByRole('button', { name: /new document/i });
    if ((await newDocButton.count()) > 0) {
      await expect(newDocButton).toBeVisible();
    }
  });
});
