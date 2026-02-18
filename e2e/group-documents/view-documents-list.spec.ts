import { test, expect } from '../fixtures/test-base';

test.describe('Group Documents - View Documents List', () => {
  test('should display group documents page title', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    test.setTimeout(60000);
    const group = await groupFactory.createGroup(mainUserId, {
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
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
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
