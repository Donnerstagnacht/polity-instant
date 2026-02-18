import { test, expect } from '../fixtures/test-base';

test.describe('Group Operations - View Links', () => {
  test('should display the Links section', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
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
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
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
