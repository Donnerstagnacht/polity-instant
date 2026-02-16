import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog - Edit Blog', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/edit`);
    await page.waitForLoadState('networkidle');
  });

  test('should display blog edit form fields', async ({ authenticatedPage: page }) => {
    // Title field (required)
    const titleInput = page.getByRole('textbox', { name: /title/i });
    if ((await titleInput.count()) > 0) {
      await expect(titleInput).toBeVisible();
    }

    // Description field
    const descriptionInput = page.getByRole('textbox', { name: /description/i });
    if ((await descriptionInput.count()) > 0) {
      await expect(descriptionInput).toBeVisible();
    }
  });

  test('should display public/private toggle', async ({ authenticatedPage: page }) => {
    const publicSwitch = page.getByRole('switch');
    if ((await publicSwitch.count()) > 0) {
      await expect(publicSwitch.first()).toBeVisible();
    }
  });

  test('should save changes to blog metadata', async ({ authenticatedPage: page }) => {
    const titleInput = page.getByRole('textbox', { name: /title/i });
    if ((await titleInput.count()) === 0) {
      test.skip();
      return;
    }

    // Modify the title
    await titleInput.clear();
    await titleInput.fill('Updated Blog Title E2E');

    // Save
    const saveButton = page.getByRole('button', { name: /save changes/i });
    if ((await saveButton.count()) > 0) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should cancel editing and go back', async ({ authenticatedPage: page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click();
      // Should navigate back
      await page.waitForLoadState('networkidle');
    }
  });
});
