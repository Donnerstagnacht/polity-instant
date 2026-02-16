// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can invite collaborators', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 1. Author clicks "Invite Collaborator" button
    const inviteButton = page.getByRole('button', { name: /invite collaborator/i });
    await expect(inviteButton).toBeVisible();
    await inviteButton.click();

    // 2. Dialog opens with user search
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 3. Author searches for user
    const searchInput = dialog.getByRole('textbox', { name: /search/i });
    await searchInput.fill('test');

    // 4. Author selects user(s) from results
    const userResult = dialog.getByRole('button').first();
    await expect(userResult).toBeVisible();
    await userResult.click();

    // 5. Author clicks "Invite" button
    const submitButton = dialog.getByRole('button', { name: /invite/i });
    await submitButton.click();

    // 6. Collaboration created with status "invited"
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(/invitation sent/i)).toBeVisible();
  });
});
