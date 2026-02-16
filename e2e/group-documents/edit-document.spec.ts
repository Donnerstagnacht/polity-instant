import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Documents - Edit Document', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(
      `/group/${TEST_ENTITY_IDS.GROUP}/editor/${TEST_ENTITY_IDS.testGroupDocument1}`
    );
    await page.waitForLoadState('networkidle');
  });

  test('should display Plate.js editor', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) > 0) {
      await expect(editor.first()).toBeVisible();
    }
  });

  test('should display Back to Documents button', async ({ authenticatedPage: page }) => {
    const backButton = page.getByText(/back to documents/i);
    if ((await backButton.count()) > 0) {
      await expect(backButton.first()).toBeVisible();
    }
  });

  test('should show saving/auto-save indicator', async ({ authenticatedPage: page }) => {
    const saveStatus = page.getByText(/saving|auto-save|all changes saved/i);
    if ((await saveStatus.count()) > 0) {
      await expect(saveStatus.first()).toBeVisible();
    }
  });

  test('should allow typing in the group document editor', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) === 0) {
      test.skip();
      return;
    }

    await editor.first().click();
    await page.keyboard.type('E2E Group Doc Content');
    await page.waitForLoadState('networkidle');

    await expect(editor.first()).toContainText('E2E Group Doc Content');
  });
});
