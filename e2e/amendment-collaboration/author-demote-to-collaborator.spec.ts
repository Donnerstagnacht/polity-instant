// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can demote admin to collaborator', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const admin = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, admin.id, amendment.authorRoleId, 'admin');

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Wait for collaborator data to sync
    await expect(page.getByRole('heading', { name: /Active Collaborators \([1-9]/ })).toBeVisible({ timeout: 10000 });

    // Author clicks "Demote to Collaborator"
    const demoteButton = page.getByRole('button', { name: /demote to collaborator/i }).first();
    await expect(demoteButton).toBeVisible();
    await demoteButton.click();

    // Admin is demoted - demote button disappears
    await expect(demoteButton).not.toBeVisible({ timeout: 5000 });
  });
});
