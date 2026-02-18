// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Cancel Request', () => {
  test('User can cancel pending participation request', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    test.setTimeout(60000);
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });

    await gotoWithRetry(page, `/event/${event.id}`);

    // Wait for the participation button to load
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    const requestButton = page.getByRole('button', { name: /request to participate/i });

    await expect(requestButton.or(pendingButton)).toBeVisible({ timeout: 15000 });

    const hasPendingRequest = await pendingButton.isVisible().catch(() => false);

    if (!hasPendingRequest) {
      for (let attempt = 0; attempt < 3; attempt++) {
        await requestButton.click();
        try {
          await expect(pendingButton).toBeVisible({ timeout: 10000 });
          break;
        } catch {
          // Click may not have registered under load — reload and retry
          await page.reload();
          await expect(requestButton.or(pendingButton)).toBeVisible({ timeout: 15000 });
          if (await pendingButton.isVisible().catch(() => false)) break;
        }
      }
    }

    // Click "Request Pending" button to cancel with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      await pendingButton.click();
      try {
        await expect(requestButton).toBeVisible({ timeout: 10000 });
        break;
      } catch {
        // Click may not have registered under load — reload and retry
        await page.reload();
        await expect(requestButton.or(pendingButton)).toBeVisible({ timeout: 15000 });
        if (await requestButton.isVisible().catch(() => false)) break;
      }
    }

    // Verify button changes back to "Request to Participate"
    await expect(requestButton).toBeVisible({ timeout: 10000 });
  });
});
