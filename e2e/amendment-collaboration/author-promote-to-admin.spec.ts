// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can promote collaborator to admin', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Wait for collaborator data to sync
    await expect(page.getByRole('heading', { name: /Active Collaborators \([1-9]/ })).toBeVisible({ timeout: 10000 });

    // Author clicks "Promote to Author"
    const promoteButton = page.getByRole('button', { name: /promote to author/i }).first();
    await expect(promoteButton).toBeVisible();
    await promoteButton.click();

    // Collaborator is promoted - promote button disappears
    await expect(promoteButton).not.toBeVisible({ timeout: 5000 });
  });
});
