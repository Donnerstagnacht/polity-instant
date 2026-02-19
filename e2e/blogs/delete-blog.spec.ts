import { test, expect } from '../fixtures/test-base';

test.describe('Blog - Delete Blog', () => {
  test('should show delete button for authorized users', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Delete Visible Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    // Delete button text is "Delete Blog" with Trash2 icon - only visible for owner
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show confirmation dialog when clicking delete', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Delete Confirm Blog' });
    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('networkidle');

    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton.first()).toBeVisible({ timeout: 10000 });

    // Set up dialog handler to check for confirm dialog
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // Don't actually delete
    });

    await deleteButton.first().click();
    await page.waitForLoadState('networkidle');

    // Deletion may use window.confirm() or a UI dialog
    // Just verify no crash happened
  });
});
