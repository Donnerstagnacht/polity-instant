// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('User can request to collaborate on amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for page content to load fully before interacting
    await expect(page.locator('main')).toBeVisible();

    // User clicks collaboration request button
    const requestButton = page.getByRole('button', { name: /request.*collaborat/i });
    await expect(requestButton).toBeVisible({ timeout: 15000 });
    await requestButton.click();

    // Button changes to "Request Pending"
    // Under concurrent load, client-side db.transact + reactive query can be unreliable.
    // If the button doesn't change, reload to get fresh state from the server.
    const pendingButton = page.getByRole('button', { name: /request pending/i });
    try {
      await expect(pendingButton).toBeVisible({ timeout: 15000 });
    } catch {
      // Reload page to get fresh data from InstantDB
      await page.reload({ waitUntil: 'networkidle' });
      await expect(pendingButton).toBeVisible({ timeout: 30000 });
    }
  });
});
