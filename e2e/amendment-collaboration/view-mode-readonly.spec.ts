// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('User can view document in view mode', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    // Create amendment by another user - mainUserId is not a collaborator
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text page as non-collaborator
    await page.goto(`/amendment/${amendment.id}/text`);

    // Non-collaborator should not have editable editor
    const editableEditor = page.locator('[contenteditable="true"]');
    // Either no editable editor, or page shows read-only content
    await page.waitForTimeout(2000);
    const hasEditable = await editableEditor.count();
    expect(hasEditable).toBe(0);
  });
});
