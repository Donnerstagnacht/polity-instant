import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Editor - Invite Collaborator', () => {
  test('should display Invite button', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.documents[docId]
        .update({
          title: 'E2E Invite Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const inviteButton = page.getByRole('button', { name: /invite/i });
    await expect(inviteButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open Invite Collaborator dialog', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const docId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.documents[docId]
        .update({
          title: 'E2E Invite Dialog Doc',
          content: [{ type: 'p', children: [{ text: '' }] }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ owner: mainUserId })
    );

    await gotoWithRetry(page, `/editor/${docId}`);

    const inviteButton = page.getByRole('button', { name: /invite/i });
    await expect(inviteButton.first()).toBeVisible({ timeout: 10000 });
    await inviteButton.first().click();

    // Dialog should appear with search functionality
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
