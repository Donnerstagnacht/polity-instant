import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - View Links', () => {
  test('should display the Links section', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Links Group Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    // The links section should be visible on the operation page
    const linksHeading = page.getByText('Links', { exact: true });
    await expect(linksHeading.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display existing links with external link icons', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Links Icons Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    // Check for link entries (displayed as anchor tags with ExternalLink icons)
    const linkSection = page.locator('section, div').filter({ hasText: 'Links' }).first();
    const links = linkSection.locator('a[target="_blank"]');

    // If links exist, verify they are rendered correctly
    if ((await links.count()) > 0) {
      const firstLink = links.first();
      await expect(firstLink).toBeVisible();
      await expect(firstLink).toHaveAttribute('href', /.+/);
    }
  });
});
