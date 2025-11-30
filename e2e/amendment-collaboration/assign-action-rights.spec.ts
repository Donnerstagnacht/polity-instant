// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can assign action rights to role', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to Roles tab
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

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
