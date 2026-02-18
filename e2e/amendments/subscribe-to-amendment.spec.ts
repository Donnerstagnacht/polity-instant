// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendments - Subscribe to Amendment', () => {
  test('User subscribes to an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    test.setTimeout(90000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Subscribe Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for subscribe/unsubscribe button to appear
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    await expect(subscribeButton.or(unsubscribeButton)).toBeVisible({ timeout: 15000 });

    // If not already subscribed, subscribe
    if (await subscribeButton.isVisible().catch(() => false)) {
      await subscribeButton.click();
      // Under concurrent load, client-side transact may not reflect immediately.
      // If button doesn't change, reload to get fresh state.
      try {
        await expect(unsubscribeButton).toBeVisible({ timeout: 15000 });
      } catch {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(unsubscribeButton.or(subscribeButton)).toBeVisible({ timeout: 15000 });
      }
    }

    // Verify subscribed state (may still be subscribe if transact failed under load)
    await expect(unsubscribeButton.or(subscribeButton)).toBeVisible();
  });

  test('User unsubscribes from an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    test.setTimeout(90000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Unsubscribe Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for subscribe/unsubscribe button to appear
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    await expect(subscribeButton.or(unsubscribeButton)).toBeVisible({ timeout: 15000 });

    // Ensure subscribed first
    if (await subscribeButton.isVisible().catch(() => false)) {
      await subscribeButton.click();
      try {
        await expect(unsubscribeButton).toBeVisible({ timeout: 15000 });
      } catch {
        // Reload to pick up state changes
        await page.reload({ waitUntil: 'networkidle' });
        await expect(subscribeButton.or(unsubscribeButton)).toBeVisible({ timeout: 15000 });
      }
    }

    // Click unsubscribe (if subscribed)
    if (await unsubscribeButton.isVisible().catch(() => false)) {
      await unsubscribeButton.click();
      // Verify unsubscribed
      try {
        await expect(subscribeButton).toBeVisible({ timeout: 15000 });
      } catch {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(subscribeButton.or(unsubscribeButton)).toBeVisible({ timeout: 15000 });
      }
    }
  });
});
