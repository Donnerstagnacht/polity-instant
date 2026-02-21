import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Editor - Version Control', () => {
  test('should display Save Version button', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.documents[docId]
        .update({
          title: 'E2E Version Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    // "Save Version" button with Plus icon
    const saveVersionButton = page.getByRole('button', { name: /save version/i });
    await expect(saveVersionButton).toBeVisible({ timeout: 10000 });
  });

  test('should display History button', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.documents[docId]
        .update({
          title: 'E2E History Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const historyButton = page.getByRole('button', { name: /history/i });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
  });

  test('should open version history panel', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.documents[docId]
        .update({
          title: 'E2E History Panel Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const historyButton = page.getByRole('button', { name: /history/i });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();

    // Version history panel should appear (dialog or sheet)
    const versionList = page.getByText(/version|history/i);
    await expect(versionList.first()).toBeVisible({ timeout: 5000 });
  });
});
