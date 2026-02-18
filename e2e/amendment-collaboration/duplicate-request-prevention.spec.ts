// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Duplicate collaboration request prevention', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Pre-create collaboration request via admin SDK (reliable, bypasses client-side transact timing)
    await amendmentFactory.addCollaborator(amendment.id, mainUserId, amendment.collaboratorRoleId, 'requested');

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Button should show "Request Pending" (collaboration request already exists)
    const pendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(pendingButton).toBeVisible({ timeout: 30000 });

    // Cannot request again - "Request Collaboration" button is gone
    const requestButton = page.getByRole('button', { name: /request.*collaborat/i });
    await expect(requestButton).not.toBeVisible();
  });
});
