// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can invite collaborators', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create a user to invite
    const invitee = await userFactory.createUser();

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Author clicks "Invite Collaborator" button
    const inviteButton = page.getByRole('button', { name: /invite collaborator/i });
    await expect(inviteButton).toBeVisible({ timeout: 10000 });
    await inviteButton.click();

    // Dialog opens with user search
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Author searches for user by name
    const searchInput = dialog.getByPlaceholder(/search by name/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill(invitee.name.split(' ')[0]);

    // Author selects user from results
    const userResult = dialog.locator('[cmdk-item]').first();
    await expect(userResult).toBeVisible({ timeout: 10000 });
    await userResult.click();

    // Author clicks "Invite" button
    const submitButton = dialog.getByRole('button', { name: /invite/i }).last();
    await submitButton.click();

    // Dialog closes after invitation sent
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });
});
