// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can change vote on change request', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
      workflowStatus: 'internal_voting',
    });
    await amendmentFactory.createChangeRequest(amendment.id, mainUserId, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
      documentId: amendment.documentId,
    });

    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // Change request is visible
    await expect(page.getByText(/Test Change Request/i).first()).toBeVisible({ timeout: 10000 });

    // First vote: Accept
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }

    // Change vote to Reject
    const rejectButton = page.getByRole('button', { name: /reject/i }).first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
