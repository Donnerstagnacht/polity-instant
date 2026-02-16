// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can make direct edits in edit mode', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. Author navigates to amendment text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // 2. Author switches to "Edit" mode
    const modeSelector = page.getByRole('button', { name: /edit/i });
    await expect(modeSelector).toBeVisible();
    await modeSelector.click();

    // 3. Author makes text changes
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.type('Direct edit content');

    // 4. Changes are applied directly
    // 5. No suggestion tracking
    await expect(page.getByText(/direct edit content/i)).toBeVisible();
  });
});
