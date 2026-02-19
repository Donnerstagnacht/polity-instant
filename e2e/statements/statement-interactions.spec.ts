import { test, expect } from '../fixtures/test-base';

test.describe('Statement - Agree Interaction', () => {
  test('should toggle agree when clicking agree button', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    // Create a statement via adminDb
    const statementId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.statements[statementId]
        .update({
          text: 'E2E Agree Statement',
          tag: 'politics',
          agreeCount: 0,
          disagreeCount: 0,
          createdAt: Date.now(),
        })
        .link({ creator: mainUserId })
    );

    await page.goto(`/statement/${statementId}`);
    await page.waitForLoadState('networkidle');

    const agreeButton = page.getByRole('button', { name: /agree/i });
    await expect(agreeButton.first()).toBeVisible({ timeout: 10000 });
    await agreeButton.first().click();
  });

  test('should open comment section when clicking comment button', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const statementId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.statements[statementId]
        .update({
          text: 'E2E Comment Statement',
          tag: 'education',
          agreeCount: 0,
          disagreeCount: 0,
          createdAt: Date.now(),
        })
        .link({ creator: mainUserId })
    );

    await page.goto(`/statement/${statementId}`);
    await page.waitForLoadState('networkidle');

    const commentButton = page.getByRole('button', { name: /comment/i });
    await expect(commentButton.first()).toBeVisible({ timeout: 10000 });
    await commentButton.first().click();
  });

  test('should save statement for later', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const statementId = crypto.randomUUID();
    await adminDb.transact(
      adminDb.tx.statements[statementId]
        .update({
          text: 'E2E Save Statement',
          tag: 'environment',
          agreeCount: 0,
          disagreeCount: 0,
          createdAt: Date.now(),
        })
        .link({ creator: mainUserId })
    );

    await page.goto(`/statement/${statementId}`);
    await page.waitForLoadState('networkidle');

    // "Save for Later" button is in the sidebar Actions card
    const saveButton = page.getByRole('button', { name: /save for later/i });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
  });
});
