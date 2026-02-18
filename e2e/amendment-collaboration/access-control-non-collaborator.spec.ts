// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Amendment Collaboration', () => {
  test('Non-collaborator cannot access collaboration management', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    test.setTimeout(60000);
    // Create an amendment owned by a different user so the main test user is NOT a collaborator
    const otherUser = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(otherUser.id, {
      title: `Non-Collab Test ${Date.now()}`,
    });

    // 1. Non-collaborator tries to access /amendment/[id]/collaborators
    await gotoWithRetry(page, `/amendment/${amendment.id}/collaborators`);

    // 2. Access is denied
    // 3. User sees "Access Denied" message
    await expect(page.getByText(/access denied|not authorized|forbidden/i)).toBeVisible({ timeout: 15000 });

    // 4. Collaboration buttons are not visible
    await expect(page.getByRole('button', { name: /invite collaborator/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /add role/i })).not.toBeVisible();
  });
});
