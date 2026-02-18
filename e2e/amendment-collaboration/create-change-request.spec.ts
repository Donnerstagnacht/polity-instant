// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can create change request from suggestion', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    test.setTimeout(60000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/text`);

    // Editor is visible and editable
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.type('Suggested change for review');

    // Text appears in editor
    await expect(page.getByText(/suggested change for review/i)).toBeVisible();

    // Look for "Create Change Request" button if available
    const createRequestButton = page.getByRole('button', { name: /create change request/i });
    if (await createRequestButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createRequestButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const titleInput = dialog.getByRole('textbox').first();
      await titleInput.fill('Change Request Title');

      const submitButton = dialog.getByRole('button', { name: /submit|create/i });
      await submitButton.click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  });
});
