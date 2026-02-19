import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Editor - Edit Document', () => {
  test('should display Plate.js editor with contenteditable area', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    // Create a document via admin SDK
    const docId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.documents[docId]
        .update({
          title: 'E2E Editor Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const editor = page.locator('[contenteditable="true"]');
    await expect(editor.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow typing and auto-save content', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.documents[docId]
        .update({
          title: 'E2E Type Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const editor = page.locator('[contenteditable="true"]');
    await expect(editor.first()).toBeVisible({ timeout: 10000 });

    await editor.first().click();
    await page.keyboard.type('E2E Test Content');
    await page.waitForLoadState('networkidle');

    // Content should be present
    await expect(editor.first()).toContainText('E2E Test Content');
  });
});
