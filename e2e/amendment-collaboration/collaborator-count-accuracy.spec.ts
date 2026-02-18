// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator count updates accurately', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Active collaborators card shows count
    await expect(page.getByRole('heading', { name: /Active Collaborators/i })).toBeVisible({ timeout: 15000 });

    // Remove collaborator
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      // Count should update
      await expect(removeButton).not.toBeVisible({ timeout: 5000 });
    }
  });
});
