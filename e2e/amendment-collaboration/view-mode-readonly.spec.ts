// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can view document in view mode', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. User navigates to amendment text
    await page.goto(`/amendment/${amendment.id}/text`);

    // 2. Document is in "View" mode
    const viewModeButton = page.getByRole('button', { name: /view/i });
    await expect(viewModeButton).toBeVisible();
    await viewModeButton.click();

    // 3. User can read content
    const content = page.locator('.document-content, [data-document-content]').first();
    await expect(content).toBeVisible();

    // 4. No editing controls visible
    const editableEditor = page.locator('[contenteditable="true"]');
    await expect(editableEditor).not.toBeVisible();

    // 5. Suggestions are visible but cannot be modified
    await expect(content).not.toHaveAttribute('contenteditable', 'true');
  });
});
