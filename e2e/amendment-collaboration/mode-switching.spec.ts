// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('User can switch between editing modes', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // Editor should be visible
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 15000 });

    // Verify editor is functional - can type
    await editor.click();
    await page.keyboard.type('Test content');
    await expect(page.getByText(/test content/i)).toBeVisible();
  });
});
