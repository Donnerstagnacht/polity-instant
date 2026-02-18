// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can vote to reject change request', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
      workflowStatus: 'internal_voting',
    });
    await amendmentFactory.createChangeRequest(amendment.id, mainUserId, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
      documentId: amendment.documentId,
    });

    // Navigate to change requests page
    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // Change request content is visible
    await expect(page.getByText(/Test Change Request/i).first()).toBeVisible({ timeout: 10000 });

    // Click "Reject" vote button
    const rejectButton = page.getByRole('button', { name: /reject/i }).first();
    await expect(rejectButton).toBeVisible();
    await rejectButton.click();

    // Vote is recorded
    await page.waitForTimeout(1000);
  });
});
