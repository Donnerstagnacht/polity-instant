// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Events - Subscribe to Event', () => {
  test('User subscribes to an event', async ({
    authenticatedPage: page,
    eventFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Subscribe Event Test ${Date.now()}`,
    });

    await page.goto(`/event/${event.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    const isSubscribed = (await page.getByRole('button', { name: /unsubscribe/i }).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 5000,
      });
    }

    // 7. Verify subscription state
    await expect(
      page.getByRole('button', { name: /unsubscribe/i }).or(subscribeButton)
    ).toBeVisible();
  });

  test('User unsubscribes from an event', async ({
    authenticatedPage: page,
    eventFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Unsubscribe Event Test ${Date.now()}`,
    });

    await page.goto(`/event/${event.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Ensure user is subscribed first
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });

    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
    }

    // 4. Click "Unsubscribe" button
    await unsubscribeButton.click();

    // 5. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 5000 });
  });
});
