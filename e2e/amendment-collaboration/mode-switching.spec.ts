// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can switch between editing modes', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. User navigates to amendment text editor
    await page.goto(`/amendment/${amendment.id}/text`);

    // 2. User clicks mode selector
    // 3. User selects different mode (View/Suggest/Edit)
    const viewButton = page.getByRole('button', { name: /^view$/i });
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // 4. Editor updates to selected mode
    await expect(page.locator('[contenteditable="true"]')).not.toBeVisible();

    const suggestButton = page.getByRole('button', { name: /suggest/i });
    await suggestButton.click();

    // 5. Controls update based on permissions
    await expect(page.locator('[contenteditable="true"]')).toBeVisible();

    const editButton = page.getByRole('button', { name: /^edit$/i });
    await editButton.click();
    await expect(page.locator('[contenteditable="true"]')).toBeVisible();
  });
});
