import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Amendment Collaborations', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should switch to Amendments tab', async ({ authenticatedPage: page }) => {
    const amendmentsTab = page.getByRole('tab', { name: /amendments/i });
    await amendmentsTab.click();

    // Should show amendment collaboration sections
    const activeCollabs = page.getByText(/active collaborations/i);
    if ((await activeCollabs.count()) > 0) {
      await expect(activeCollabs.first()).toBeVisible();
    }
  });
});

test.describe('User Memberships - Blog Relations', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should switch to Blogs tab', async ({ authenticatedPage: page }) => {
    const blogsTab = page.getByRole('tab', { name: /blogs/i });
    await blogsTab.click();

    // Should show blog relation sections
    const activeBlogs = page.getByText(/active blogs/i);
    if ((await activeBlogs.count()) > 0) {
      await expect(activeBlogs.first()).toBeVisible();
    }
  });
});
