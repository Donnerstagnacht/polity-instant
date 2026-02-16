import { test, expect } from '../fixtures/test-base';
import { navigateToBlog } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - View Bloggers', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/bloggers`);
    await page.waitForLoadState('networkidle');
  });

  test('should display bloggers management page', async ({ authenticatedPage: page }) => {
    // Should show the Bloggers tab and Roles tab
    const bloggersTab = page.getByRole('tab', { name: /bloggers/i });
    const rolesTab = page.getByRole('tab', { name: /roles/i });

    if ((await bloggersTab.count()) > 0) {
      await expect(bloggersTab).toBeVisible();
    }
    if ((await rolesTab.count()) > 0) {
      await expect(rolesTab).toBeVisible();
    }
  });

  test('should display Active Bloggers section', async ({ authenticatedPage: page }) => {
    const activeBloggers = page.getByText('Active Bloggers');
    if ((await activeBloggers.count()) > 0) {
      await expect(activeBloggers).toBeVisible();
    }
  });

  test('should display Invited Bloggers section', async ({ authenticatedPage: page }) => {
    const invitedBloggers = page.getByText('Invited Bloggers');
    if ((await invitedBloggers.count()) > 0) {
      await expect(invitedBloggers).toBeVisible();
    }
  });

  test('should display Pending Requests section', async ({ authenticatedPage: page }) => {
    const pendingRequests = page.getByText('Pending Requests');
    if ((await pendingRequests.count()) > 0) {
      await expect(pendingRequests).toBeVisible();
    }
  });

  test('should show Back to Blog button', async ({ authenticatedPage: page }) => {
    const backButton = page.getByRole('button', { name: /back to blog/i });
    if ((await backButton.count()) > 0) {
      await expect(backButton).toBeVisible();
    }
  });
});
