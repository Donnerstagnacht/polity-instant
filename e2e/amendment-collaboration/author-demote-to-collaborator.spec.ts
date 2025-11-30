// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can demote admin to collaborator', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    // 2. Author finds admin in active collaborators list
    const activeCollaborators = page.getByText(/active collaborators/i).locator('..');
    await expect(activeCollaborators).toBeVisible();

    // 3. Author clicks "Demote to Collaborator"
    const demoteButton = activeCollaborators
      .getByRole('button', { name: /demote to collaborator/i })
      .first();
    await expect(demoteButton).toBeVisible();
    await demoteButton.click();

    // 4. Admin's role changes to "Collaborator"
    // 5. User loses admin permissions
    await expect(demoteButton).not.toBeVisible();
    await expect(
      activeCollaborators.getByRole('button', { name: /promote to admin/i }).first()
    ).toBeVisible();
  });
});
