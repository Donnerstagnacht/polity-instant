// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can promote collaborator to admin', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    // 2. Author finds collaborator in active collaborators list
    const activeCollaborators = page.getByText(/active collaborators/i).locator('..');
    await expect(activeCollaborators).toBeVisible();

    // 3. Author clicks "Promote to Admin"
    const promoteButton = activeCollaborators
      .getByRole('button', { name: /promote to admin/i })
      .first();
    await expect(promoteButton).toBeVisible();
    await promoteButton.click();

    // 4. Collaborator's role changes to "Admin"
    // 5. Collaborator gains admin permissions
    await expect(promoteButton).not.toBeVisible();
    await expect(activeCollaborators.getByText(/admin/i).first()).toBeVisible();
  });
});
