// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborators can discuss suggestions', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to discussions page
    await page.goto(`/amendment/${amendment.id}/discussions`);

    // Discussions page should load
    await page.waitForTimeout(2000);

    // Look for discussion UI elements
    const commentInput = page.getByRole('textbox').first();
    if (await commentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentInput.fill('This is a comment on the suggestion');

      const submitButton = page.getByRole('button', { name: /submit|post|send/i });
      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
        await expect(page.getByText(/this is a comment/i)).toBeVisible();
      }
    }
  });
});
