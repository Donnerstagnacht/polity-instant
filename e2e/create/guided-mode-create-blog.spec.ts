import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Blog', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Blogs entity type
    const blogsOption = page
      .locator('text=Blogs')
      .or(page.locator('[data-entity="blogs"]'))
      .first();
    await blogsOption.click();

    await page.waitForTimeout(500);

    // Enter blog title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('The Future of Technology in 2024');

    // Advance carousel
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter blog content
    const contentInput = page
      .locator('textarea[name="content"]')
      .or(page.locator('[contenteditable="true"]'))
      .or(page.getByPlaceholder(/content/i))
      .first();
    await contentInput.fill(
      'Technology continues to evolve at a rapid pace. This blog explores the trends shaping our future.'
    );

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Add hashtags
    const hashtagInput = page
      .locator('input[name="hashtags"]')
      .or(page.getByPlaceholder(/tag/i))
      .first();
    if (await hashtagInput.isVisible()) {
      await hashtagInput.fill('#technology #future');
      await page.keyboard.press('Enter');
    }

    // Click Create Blog button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for navigation or success
    await page.waitForURL(/\/blog\//, { timeout: 5000 }).catch(() => {
      return;
    });

    // Verify success
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
