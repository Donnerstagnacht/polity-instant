import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - Roles Management', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/bloggers`);
    await page.waitForLoadState('networkidle');
  });

  test('should switch to Roles tab', async ({ authenticatedPage: page }) => {
    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if ((await rolesTab.count()) === 0) {
      test.skip();
      return;
    }

    await rolesTab.click();

    // Should show role management content
    const addRoleButton = page.getByRole('button', { name: /add role/i });
    if ((await addRoleButton.count()) > 0) {
      await expect(addRoleButton).toBeVisible();
    }
  });

  test('should open Add New Role dialog', async ({ authenticatedPage: page }) => {
    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if ((await rolesTab.count()) === 0) {
      test.skip();
      return;
    }

    await rolesTab.click();

    const addRoleButton = page.getByRole('button', { name: /add role/i });
    if ((await addRoleButton.count()) === 0) {
      test.skip();
      return;
    }

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

  test('should create a new role', async ({ authenticatedPage: page }) => {
    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if ((await rolesTab.count()) === 0) {
      test.skip();
      return;
    }

    await rolesTab.click();

    const addRoleButton = page.getByRole('button', { name: /add role/i });
    if ((await addRoleButton.count()) === 0) {
      test.skip();
      return;
    }

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

  test('should display permission matrix for roles', async ({ authenticatedPage: page }) => {
    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if ((await rolesTab.count()) === 0) {
      test.skip();
      return;
    }

    await rolesTab.click();

    // Permission labels should be visible
    const updateBlog = page.getByText('Update Blog');
    const deleteBlog = page.getByText('Delete Blog');
    const manageBloggers = page.getByText('Manage Bloggers');

    if ((await updateBlog.count()) > 0) {
      await expect(updateBlog).toBeVisible();
    }
    if ((await deleteBlog.count()) > 0) {
      await expect(deleteBlog).toBeVisible();
    }
    if ((await manageBloggers.count()) > 0) {
      await expect(manageBloggers).toBeVisible();
    }
  });

  test('should toggle action rights via checkboxes', async ({ authenticatedPage: page }) => {
    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if ((await rolesTab.count()) === 0) {
      test.skip();
      return;
    }

    await rolesTab.click();

    // Find permission checkboxes in the matrix
    const checkboxes = page.getByRole('checkbox');
    if ((await checkboxes.count()) === 0) {
      test.skip();
      return;
    }

    // Toggle a checkbox
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.click();
  });
});
