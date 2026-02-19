import { test, expect } from '../fixtures/test-base';

test.describe('Blog Bloggers - Roles Management', () => {
  test('should switch to Roles tab', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Roles Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    // Should show role management content - "Role Permissions" card
    await expect(page.getByText('Role Permissions')).toBeVisible({ timeout: 5000 });
  });

  test('should open Add New Role dialog', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Add Role Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    const addRoleButton = page.getByRole('button', { name: /add role/i });
    await expect(addRoleButton).toBeVisible({ timeout: 5000 });
    await addRoleButton.click();

    // Dialog should appear
    await expect(page.getByText('Add New Role')).toBeVisible();
    await expect(
      page.getByText('Create a new role with custom permissions for this blog')
    ).toBeVisible();

    // Form fields
    const roleName = page.getByLabel(/role name/i);
    await expect(roleName).toBeVisible();
  });

  test('should create a new role', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Create Role Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    const addRoleButton = page.getByRole('button', { name: /add role/i });
    await expect(addRoleButton).toBeVisible({ timeout: 5000 });
    await addRoleButton.click();
    await expect(page.getByText('Add New Role')).toBeVisible();

    // Fill in role name
    const roleName = page.getByLabel(/role name/i);
    await roleName.fill('E2E Test Role');

    // Submit
    const createButton = page.getByRole('button', { name: /create role/i });
    await createButton.click();

    // Role should appear in the list
    await page.waitForLoadState('networkidle');
  });

  test('should display permission matrix for roles', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Perms Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    // Permission labels should be visible
    await expect(page.getByText('Update Blog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Delete Blog')).toBeVisible();
    await expect(page.getByText('Manage Bloggers').first()).toBeVisible();
  });

  test('should toggle action rights via checkboxes', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Toggle Perms Blog' });
    await page.goto(`/blog/${blog.id}/bloggers`);
    await page.waitForLoadState('networkidle');

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible({ timeout: 10000 });
    await rolesTab.click();

    // Find permission checkboxes in the matrix
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });

    // Toggle a checkbox
    await checkboxes.first().click();
  });
});
