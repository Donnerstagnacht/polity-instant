// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Amendment Collaboration', () => {
  test('Author can remove collaborator from amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    await gotoWithRetry(page, `/amendment/${amendment.id}/collaborators`);

    // Wait for collaborator data to sync
    await expect(page.getByRole('heading', { name: /Active Collaborators \([1-9]/ })).toBeVisible({ timeout: 15000 });

    // Author clicks "Remove" button (Trash icon)
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    // Collaborator is removed
    await expect(removeButton).not.toBeVisible({ timeout: 5000 });
  });
});
