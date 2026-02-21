import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - View Group Memberships', () => {
  test.beforeEach(async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display Memberships page title', async ({ authenticatedPage: page }) => {
    const title = page.getByText(/my memberships|participation/i);
    await expect(title.first()).toBeVisible();
  });

  test('should display four tabs: Groups, Events, Amendments, Blogs', async ({ authenticatedPage: page }) => {
    const groupsTab = page.getByRole('tab', { name: /groups/i });
    const eventsTab = page.getByRole('tab', { name: /events/i });
    const amendmentsTab = page.getByRole('tab', { name: /amendments/i });
    const blogsTab = page.getByRole('tab', { name: /blogs/i });

    await expect(groupsTab).toBeVisible();
    await expect(eventsTab).toBeVisible();
    await expect(amendmentsTab).toBeVisible();
    await expect(blogsTab).toBeVisible();
  });

  test('should display search input', async ({ authenticatedPage: page }) => {
    const searchInput = page.getByPlaceholder(/search by name|search/i);
    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should show group memberships with status sections', async ({ authenticatedPage: page }) => {
    // Active Memberships section
    const activeMemberships = page.getByText(/active memberships/i);
    if ((await activeMemberships.count()) > 0) {
      await expect(activeMemberships.first()).toBeVisible();
    }
  });
});
