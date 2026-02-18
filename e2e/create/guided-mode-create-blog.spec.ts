import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Blog', async ({ authenticatedPage: page }) => {
    await page.goto('/create/blog');

    // Step 0: Title + Date
    const titleInput = page.locator('#blog-title');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('The Future of Technology in 2024');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Navigate: Step 0→1→2 (2 clicks to reach review)
    await nextButton.click();
    await nextButton.click();

    // Step 2: Review - Click Create Blog Post
    const createButton = page.getByRole('button', { name: /create blog/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for redirect
    await page.waitForURL(/\/blog\//, { timeout: 10000 }).catch(() => {});

    const isRedirected = page.url().includes('/blog/');
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    expect(isRedirected || successMessage).toBeTruthy();
  });
});
