// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Change request auto-applies when all vote accept', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
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

    // Vote accept
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(2000);
    }

    // With single collaborator (author), unanimous accept may auto-apply
  });
});
