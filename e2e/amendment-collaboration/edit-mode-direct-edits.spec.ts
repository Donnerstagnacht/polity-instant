// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can make direct edits in edit mode', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // Editor is editable (default collaborative_editing mode)
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    await editor.click();
    await page.keyboard.type('Direct edit content');

    // Changes appear in editor
    await expect(page.getByText(/direct edit content/i)).toBeVisible();
  });
});
