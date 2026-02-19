import { test, expect } from '../fixtures/test-base';

test.describe('Blog - Edit Blog', () => {
  test('should display blog edit form fields', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Edit Form Blog' });
    await page.goto(`/blog/${blog.id}/edit`);
    await page.waitForLoadState('networkidle');

    // Title field - id="title"
    const titleInput = page.locator('#title');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    // Description field - id="description"
    const descriptionInput = page.locator('#description');
    await expect(descriptionInput).toBeVisible();
  });

  test('should display public/private toggle', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Toggle Blog' });
    await page.goto(`/blog/${blog.id}/edit`);
    await page.waitForLoadState('networkidle');

    const publicSwitch = page.getByRole('switch');
    await expect(publicSwitch.first()).toBeVisible({ timeout: 10000 });
  });

  test('should save changes to blog metadata', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Save Blog' });
    await page.goto(`/blog/${blog.id}/edit`);
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('#title');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    // Modify the title
    await titleInput.clear();
    await titleInput.fill('Updated Blog Title E2E');

    // Save - button text is "Save Changes"
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  });

  test('should cancel editing and go back', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, { title: 'E2E Cancel Blog' });
    await page.goto(`/blog/${blog.id}/edit`);
    await page.waitForLoadState('networkidle');

    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible({ timeout: 10000 });
    await cancelButton.click();
    // Should navigate back to blog detail
    await page.waitForLoadState('networkidle');
  });
});
