// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can create new role', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to Roles tab
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    await expect(rolesTab).toBeVisible();
    await rolesTab.click();

    // 2. Author clicks "Add Role"
    const addRoleButton = page.getByRole('button', { name: /add role|create role/i });
    await expect(addRoleButton).toBeVisible();
    await addRoleButton.click();

    // 3. Dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 4. Author enters role name and description
    const nameInput = dialog.getByRole('textbox', { name: /name/i });
    await nameInput.fill('Reviewer');

    const descriptionInput = dialog.getByRole('textbox', { name: /description/i });
    await descriptionInput.fill('Can review and comment on amendments');

    // 5. Author clicks "Create Role"
    const createButton = dialog.getByRole('button', { name: /create|save/i });
    await createButton.click();

    // 6. Role appears in roles list
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(/reviewer/i)).toBeVisible();

    // 7. Role available for assignment
    await expect(page.getByText(/can review and comment/i)).toBeVisible();
  });
});
