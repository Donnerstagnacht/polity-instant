// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can make suggestions in suggest mode', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // Editor should be visible and editable
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    await editor.click();
    await page.keyboard.type('This is a suggestion');

    // Text appears in editor
    await expect(page.getByText(/this is a suggestion/i)).toBeVisible();
  });
});
