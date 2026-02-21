import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Documents - Edit Document', () => {
  test('should display Plate.js editor', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
    adminDb,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Doc Edit Group' });
    // Create a group document via admin SDK
    const docId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.documents[docId]
        .update({
          title: 'E2E Test Document',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ group: group.id, owner: mainUserId })
    );

    await gotoWithRetry(page, `/group/${group.id}/editor/${docId}`);

    const editor = page.locator('[contenteditable="true"]');
    await expect(editor.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow typing in the group document editor', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
    adminDb,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Doc Type Group' });
    const docId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.documents[docId]
        .update({
          title: 'E2E Type Document',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ group: group.id, owner: mainUserId })
    );

    await gotoWithRetry(page, `/group/${group.id}/editor/${docId}`);

    const editor = page.locator('[contenteditable="true"]');
    await expect(editor.first()).toBeVisible({ timeout: 10000 });

    await editor.first().click();
    await page.keyboard.type('E2E Group Doc Content');
    await page.waitForLoadState('networkidle');

    await expect(editor.first()).toContainText('E2E Group Doc Content');
  });
});
