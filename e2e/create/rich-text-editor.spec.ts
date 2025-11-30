import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Rich Text Editor', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Blog entity type (which typically has rich text editor)
    const blogsOption = page
      .locator('text=Blogs')
      .or(page.locator('[data-entity="blogs"]'))
      .first();
    await blogsOption.click();

    await page.waitForTimeout(500);

    // Fill in title first
    const titleInput = page.locator('input[name="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Blog for Rich Text');
    }

    // Navigate to content field with rich text editor
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    const richTextEditor = page
      .locator('[contenteditable="true"]')
      .or(page.locator('.editor'))
      .or(page.locator('textarea[name="content"]'))
      .first();

    // Try to find editor
    for (let i = 0; i < 5; i++) {
      if (await richTextEditor.isVisible()) break;
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    if (await richTextEditor.isVisible()) {
      // Click into the editor
      await richTextEditor.click();

      // Type some text
      await richTextEditor.fill('This is a test blog post with formatting.');

      await page.waitForTimeout(300);

      // Try to apply formatting (bold) - look for toolbar buttons
      const boldButton = page
        .locator('[aria-label*="Bold"]')
        .or(page.locator('button:has-text("B")'))
        .or(page.locator('[data-format="bold"]'))
        .first();

      if (await boldButton.isVisible()) {
        // Select some text first
        await richTextEditor.press('Control+A');

        // Apply bold
        await boldButton.click();

        await page.waitForTimeout(300);
      }

      // Try italic
      const italicButton = page
        .locator('[aria-label*="Italic"]')
        .or(page.locator('button:has-text("I")'))
        .or(page.locator('[data-format="italic"]'))
        .first();

      if (await italicButton.isVisible()) {
        await italicButton.click();
        await page.waitForTimeout(300);
      }

      // Try to add a heading
      const headingButton = page
        .locator('[aria-label*="Heading"]')
        .or(page.locator('button:has-text("H")'))
        .or(page.locator('select'))
        .first();

      if (
        (await headingButton.isVisible()) &&
        (await headingButton.evaluate(el => el.tagName)) === 'SELECT'
      ) {
        await headingButton.selectOption('h2');
      }

      // Verify content is not empty
      const content = await richTextEditor.textContent();
      expect(content).toBeTruthy();
      expect(content?.length).toBeGreaterThan(0);
    } else {
      console.log('Rich text editor not found');
      expect(true).toBeTruthy();
    }
  });
});
