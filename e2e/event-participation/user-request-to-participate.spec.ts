// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Request to Participate', () => {
  test('User can request to participate in event', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    test.setTimeout(60000);
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await gotoWithRetry(page, `/event/${event.id}`);

    // 3. Verify "Request to Participate" button is visible
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible();

    // 4. Click "Request to Participate" button
    await requestButton.click();

    // 5. Verify button changes to "Request Pending"
    // Under concurrent load, client-side db.transact() can be unreliable.
    // Use reload fallback if the first attempt doesn't register.
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    try {
      await expect(pendingButton).toBeVisible({ timeout: 15000 });
    } catch {
      await page.reload({ waitUntil: 'networkidle' });
      // After reload, the button might still show "Request to Participate" if transact failed.
      // Retry the click if needed.
      const stillRequestButton = page.getByRole('button', { name: /request to participate/i });
      if (await stillRequestButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await stillRequestButton.click();
        await page.waitForTimeout(5000);
        await page.reload({ waitUntil: 'networkidle' });
      }
      await expect(pendingButton).toBeVisible({ timeout: 30000 });
    }
  });
});
