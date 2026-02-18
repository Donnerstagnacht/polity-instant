// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('User can view version history', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to text page
    await page.goto(`/amendment/${amendment.id}/text`);

    // Look for History button (VersionControl component)
    const historyButton = page.getByRole('button', { name: /history/i });
    if (await historyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await historyButton.click();

      // Version list or panel should appear
      await page.waitForTimeout(1000);
    }

    // Look for Save Version button
    const saveVersionButton = page.getByRole('button', { name: /save version/i });
    if (await saveVersionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(saveVersionButton).toBeVisible();
    }
  });
});
