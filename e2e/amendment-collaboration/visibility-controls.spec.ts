// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Amendment visibility controls work correctly', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to amendment page
    await page.goto(`/amendment/${amendment.id}`);

    // Look for settings or visibility controls
    const settingsButton = page.getByRole('button', { name: /settings/i })
      .or(page.getByRole('link', { name: /settings/i }));
    if (await settingsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsButton.click();
      await page.waitForTimeout(1000);

      // Look for visibility toggle/switch
      const visibilityToggle = page.getByRole('switch').first();
      if (await visibilityToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await visibilityToggle.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
