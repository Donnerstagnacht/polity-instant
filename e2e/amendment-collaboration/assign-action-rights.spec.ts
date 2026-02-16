// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can assign action rights to role', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. Author navigates to Roles tab
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible();
    await rolesTab.click();

    // 2. Author sees action rights matrix
    const actionRightsMatrix = page.locator('.action-rights, [data-action-rights]');
    await expect(actionRightsMatrix).toBeVisible();

    // 3. Author toggles checkboxes for permissions (view, update, delete documents, etc.)
    const viewCheckbox = actionRightsMatrix.getByRole('checkbox', { name: /view/i }).first();
    await expect(viewCheckbox).toBeVisible();
    await viewCheckbox.click();

    const updateCheckbox = actionRightsMatrix
      .getByRole('checkbox', { name: /update|edit/i })
      .first();
    await updateCheckbox.click();

    // 4. Permissions are saved
    await expect(page.getByText(/permissions updated|saved/i)).toBeVisible();

    // 5. Collaborators with that role gain/lose permissions
    await page.reload();
    await rolesTab.click();
    await expect(viewCheckbox).toBeChecked();
  });
});
