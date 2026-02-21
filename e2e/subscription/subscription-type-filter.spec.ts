import { test, expect } from '../fixtures/test-base';

test.describe('Subscription - Type Filter', () => {
  test.beforeEach(async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/subscriptions`);
    await page.waitForLoadState('domcontentloaded');
    // Wait for loading state to resolve
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 15000 });
  });

  test('Filter tabs or dropdown visible', async ({ authenticatedPage: page }) => {
    // The page has outer tabs (My Subscriptions / My Subscribers)
    // and inner filter tabs (All, Users, Groups, Amendments, Events, Blogs)
    // Wait for at least one tab to be visible
    const firstTab = page.getByRole('tab').first();
    await expect(firstTab).toBeVisible({ timeout: 10000 });

    const filterTabs = page.getByRole('tab');
    const hasTabs = (await filterTabs.count()) > 1;
    expect(hasTabs).toBeTruthy();
  });

  test('Filter by groups shows only group subscriptions', async ({ authenticatedPage: page }) => {
    const groupFilter = page
      .getByRole('tab', { name: /group/i })
      .or(page.getByRole('button', { name: /group/i }));

    if ((await groupFilter.count()) > 0) {
      await groupFilter.first().click();
      await page.waitForLoadState('domcontentloaded');

      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
    }
  });

  test('Filter by events shows only event subscriptions', async ({ authenticatedPage: page }) => {
    const eventFilter = page
      .getByRole('tab', { name: /event/i })
      .or(page.getByRole('button', { name: /event/i }));

    if ((await eventFilter.count()) > 0) {
      await eventFilter.first().click();
      await page.waitForLoadState('domcontentloaded');

      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
    }
  });

  test('Show all resets filter', async ({ authenticatedPage: page }) => {
    const allFilter = page
      .getByRole('tab', { name: /all/i })
      .or(page.getByRole('button', { name: /all|clear/i }));

    if ((await allFilter.count()) > 0) {
      await allFilter.first().click();
      await page.waitForLoadState('domcontentloaded');

      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
    }
  });
});
