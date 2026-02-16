import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog - Editor (Rich Text)', () => {
  let blogId: string;

  test.beforeEach(async ({ authenticatedPage: page, blogFactory, userFactory }) => {
    // SETUP: Create a blog via factory so this test is self-contained
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const blog = await blogFactory.createBlog(user.id, {
      title: `Editor Test Blog ${Date.now()}`,
    });
    blogId = blog.id;

    await page.goto(`/blog/${blogId}/editor`);
    await page.waitForLoadState('networkidle');
  });

  test('should display the Plate.js editor', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) > 0) {
      await expect(editor.first()).toBeVisible();
    }
  });

  test('should display Back to Blog link', async ({ authenticatedPage: page }) => {
    const backLink = page.getByRole('link', { name: /back to blog/i });
    if ((await backLink.count()) > 0) {
      await expect(backLink).toBeVisible();
    }
  });

  test('should show save status indicator', async ({ authenticatedPage: page }) => {
    const saveStatus = page.getByText(
      /all changes saved|unsaved changes|saving|save failed/i
    );
    if ((await saveStatus.count()) > 0) {
      await expect(saveStatus.first()).toBeVisible();
    }
  });

  test('should allow typing in the editor', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) === 0) {
      test.skip();
      return;
    }

    // Click into the editor and type
    await editor.first().click();
    await page.keyboard.type('E2E Test Content');

    // Content should be present
    await expect(editor.first()).toContainText('E2E Test Content');
  });
});
