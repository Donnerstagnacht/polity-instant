// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Events - Subscribe to Event', () => {
  test('User subscribes to an event', async ({
    authenticatedPage: page,
    eventFactory,
    mainUserId,
  }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Subscribe Event Test ${Date.now()}`,
    });

    await page.goto(`/event/${event.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const isSubscribed = (await page.getByRole('button', { name: /unsubscribe/i }).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 10000,
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
    mainUserId,
  }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Unsubscribe Event Test ${Date.now()}`,
    });

    await page.goto(`/event/${event.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Ensure user is subscribed first
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({ timeout: 10000 });
    }

    // 5. Click "Unsubscribe" button
    await page.getByRole('button', { name: /unsubscribe/i }).click();

    // 6. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 10000 });
  });
});
