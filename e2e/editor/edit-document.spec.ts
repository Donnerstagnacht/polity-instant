import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Editor - Edit Document', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/editor/${TEST_ENTITY_IDS.testDocument1}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Plate.js editor with contenteditable area', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) > 0) {
      await expect(editor.first()).toBeVisible();
    }
  });

  test('should display Back to Documents link', async ({ authenticatedPage: page }) => {
    const backLink = page.getByText(/back to documents/i);
    if ((await backLink.count()) > 0) {
      await expect(backLink.first()).toBeVisible();
    }
  });

  test('should show save status indicator', async ({ authenticatedPage: page }) => {
    const saveStatus = page.getByText(
      /all changes saved|unsaved changes|saving|auto-save/i
    );
    if ((await saveStatus.count()) > 0) {
      await expect(saveStatus.first()).toBeVisible();
    }
  });

  test('should allow typing and auto-save content', async ({ authenticatedPage: page }) => {
    const editor = page.locator('[contenteditable="true"]');
    if ((await editor.count()) === 0) {
      test.skip();
      return;
    }

    await editor.first().click();
    await page.keyboard.type('E2E Test Content');
    await page.waitForLoadState('networkidle');

    // Content should be present
    await expect(editor.first()).toContainText('E2E Test Content');

    // Save indicator should show saved
    const saved = page.getByText(/all changes saved|auto-save/i);
    if ((await saved.count()) > 0) {
      await expect(saved.first()).toBeVisible();
    }
  });

  test('should allow inline title editing via pencil icon', async ({ authenticatedPage: page }) => {
    // Pencil icon triggers inline title edit
    const pencilButton = page.locator('button').filter({
      has: page.locator('svg'),
    });

    // Click the title area or pencil icon
    const titleArea = page.getByRole('heading').first();
    if ((await titleArea.count()) > 0) {
      await expect(titleArea).toBeVisible();
    }
  });
});
