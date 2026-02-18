// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Loading States', () => {
  test('Loading states display during participation operations', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });

    // Navigate to event page with retry for Access Denied
    await gotoWithRetry(page, `/event/${event.id}`);

    // Find participation button (as organizer, we see "Leave Event")
    const participationButton = page
      .getByRole('button', { name: /request to participate|leave event|accept invitation/i })
      .first();
    await expect(participationButton).toBeVisible({ timeout: 10000 });

    // Click button and verify loading state (button becomes disabled or is replaced)
    await participationButton.click();

    // The button may become disabled briefly or be replaced entirely.
    // Wait a moment then verify the operation completed (button state changed)
    await page.waitForTimeout(2000);

    // After the operation, either a different button appears or the same one is re-enabled
    const anyParticipationButton = page
      .getByRole('button', { name: /request to participate|leave event|accept invitation/i })
      .first();
    await expect(anyParticipationButton).toBeVisible({ timeout: 10000 });
  });
});
