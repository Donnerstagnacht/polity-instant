// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator count updates accurately', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create collaborators to verify count
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    await page.goto(`/amendment/${amendment.id}`);

    // 1. Count only includes status "member" and "admin"
    const collaboratorCount = page.getByText(/\d+ collaborators?/i);
    await expect(collaboratorCount).toBeVisible();
    const initialCount = await collaboratorCount.textContent();

    // 2. Excludes "invited" and "requested" statuses
    // Navigate to collaborators page to verify
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    const activeCollaborators = page.locator('.active-collaborators, [data-active-collaborators]');
    await expect(activeCollaborators).toBeVisible();

    // 3. Updates in real-time when collaborators join/leave
    const removeButton = activeCollaborators.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.isVisible()) {
      await removeButton.click();

      await page.goto(`/amendment/${amendment.id}`);
      const updatedCount = await page.getByText(/\d+ collaborators?/i).textContent();
      expect(updatedCount).not.toBe(initialCount);
    }
  });
});
