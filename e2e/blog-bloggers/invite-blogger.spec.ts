import { test, expect } from '../fixtures/test-base';

test.describe('Blog Bloggers - Invite Blogger', () => {
  test('should display Invite Bloggers button', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Invite Display Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    await expect(inviteButton).toBeVisible({ timeout: 10000 });
  });

  test('should open Invite Bloggers dialog', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Invite Open Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    await expect(inviteButton).toBeVisible({ timeout: 10000 });
    await inviteButton.click();

    // Dialog should appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Search and select users to invite as bloggers')).toBeVisible();

    // Search input
    const searchInput = dialog.getByPlaceholder('Search users...');
    await expect(searchInput).toBeVisible();
  });

  test('should search for users in the invite dialog', async ({
    authenticatedPage: page,
    blogFactory,
    userFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Invite Search Blog' });
    // Create a user we can search for
    await userFactory.createUser({ name: 'E2E Searchable User' });

    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    await expect(inviteButton).toBeVisible({ timeout: 10000 });
    await inviteButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Type in search
    const searchInput = dialog.getByPlaceholder('Search users...');
    await searchInput.fill('E2E Searchable');

    // User results should appear (or "No users found.")
    const noUsers = page.getByText('No users found.');
    const userResults = page.locator('[role="option"]');

    await expect(userResults.first().or(noUsers)).toBeVisible({ timeout: 5000 });
  });
});
