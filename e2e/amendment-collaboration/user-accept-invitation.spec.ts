// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can accept collaboration invitation', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    // Create amendment owned by another user, invite the test user
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await amendmentFactory.addCollaborator(amendment.id, testUser.id, amendment.collaboratorRoleId, 'invited');

    // 1. User is invited to amendment (status: "invited")
    // 2. User navigates to amendment page
    await page.goto(`/amendment/${amendment.id}`);

    // 3. User sees "Accept Invitation" button
    const acceptButton = page.getByRole('button', { name: /accept invitation/i });
    await expect(acceptButton).toBeVisible();

    // 4. User clicks button
    await acceptButton.click();

    // 5. Status changes to "member"
    // 6. Button changes to "Leave Collaboration"
    await expect(page.getByRole('button', { name: /leave collaboration/i })).toBeVisible();
    await expect(acceptButton).not.toBeVisible();
  });
});
