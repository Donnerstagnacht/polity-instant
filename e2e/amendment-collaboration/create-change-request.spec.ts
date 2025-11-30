// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can create change request from suggestion', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/text`);

    // 1. Collaborator makes suggestion in document
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.type('Suggested change for review');

    // 2. Suggestion has discussion thread
    // 3. Collaborator clicks "Create Change Request"
    const createRequestButton = page.getByRole('button', { name: /create change request/i });
    await expect(createRequestButton).toBeVisible();
    await createRequestButton.click();

    // 4. Dialog opens with pre-filled data
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 5. Collaborator enters title, description, justification
    const titleInput = dialog.getByRole('textbox', { name: /title/i });
    await titleInput.fill('Change Request Title');

    const descriptionInput = dialog.getByRole('textbox', { name: /description/i });
    await descriptionInput.fill('Change description');

    // 6. Change request is created
    const submitButton = dialog.getByRole('button', { name: /submit|create/i });
    await submitButton.click();

    // 7. Voting begins if required
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(/change request created/i)).toBeVisible();
  });
});
