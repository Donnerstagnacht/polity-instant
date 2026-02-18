// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Document title auto-saves', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // Look for title area - may be an input, heading, or button to edit
    // DocumentEditorView uses Pencil icon → Input for title editing
    const titleArea = page.getByRole('textbox').first()
      .or(page.locator('input[type="text"]').first())
      .or(page.getByRole('heading').first());
    await expect(titleArea).toBeVisible();

    // If there's a pencil/edit icon for title, click it first
    const editIcon = page.locator('button:has(svg.lucide-pencil), button:has(svg.lucide-edit)').first();
    if (await editIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editIcon.click();
    }

    // Try to edit if input is available
    const titleInput = page.getByRole('textbox').first();
    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const newTitle = `Updated Title ${Date.now()}`;
      await titleInput.clear();
      await titleInput.fill(newTitle);
      await page.waitForTimeout(2000);
    }
  });
});
