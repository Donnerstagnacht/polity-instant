import { type Page, expect } from '@playwright/test';

// Re-export navigation helpers from canonical source to avoid breaking existing imports
export {
  navigateToUserProfile,
  navigateToGroup,
  navigateToEvent,
  navigateToBlog,
  navigateToAmendment,
} from './navigation';

/**
 * Finds and returns the subscribe/unsubscribe button
 */
export async function getSubscribeButton(page: Page) {
  const button = page.getByRole('button', { name: /subscribe|unsubscribe/i });
  return button.first();
}

/**
 * Clicks the subscribe/unsubscribe button
 */
export async function clickSubscribeButton(page: Page) {
  const button = await getSubscribeButton(page);
  await button.click();
}

/**
 * Clicks subscribe/unsubscribe and waits for the state to toggle, with retry + reload fallback.
 * Under parallel load, db.transact may silently fail, so we retry the click.
 */
export async function clickSubscribeAndWait(page: Page, expectSubscribed: boolean, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await clickSubscribeButton(page);
    try {
      await waitForSubscribeState(page, expectSubscribed, 10000);
      return;
    } catch {
      // Click may not have registered or db.transact failed under load — reload and retry
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      // Wait for subscribe button to reappear
      const anyButton = page.getByRole('button', { name: /subscribe/i }).first();
      await expect(anyButton).toBeVisible({ timeout: 10000 });
      // Check if state actually changed (maybe just the wait timed out)
      const currentlySubscribed = await isSubscribed(page);
      if (currentlySubscribed === expectSubscribed) return;
    }
  }
  // Final attempt without catch
  await clickSubscribeButton(page);
  await waitForSubscribeState(page, expectSubscribed, 15000);
}

/**
 * Gets the current subscriber count from the page
 */
export async function getSubscriberCount(page: Page): Promise<number> {
  const subscriberElement = page.locator('text=/\\d+\\s*subscriber/i').first();

  try {
    const text = await subscriberElement.textContent({ timeout: 2000 });
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Checks if currently subscribed by checking button text
 */
export async function isSubscribed(page: Page): Promise<boolean> {
  const button = await getSubscribeButton(page);
  const text = await button.textContent();
  return text?.toLowerCase().includes('unsubscribe') ?? false;
}

/**
 * Waits for the subscribe button to show a specific state
 */
export async function waitForSubscribeState(page: Page, subscribed: boolean, timeout = 15000) {
  const expectedText = subscribed ? /unsubscribe/i : /^subscribe$/i;
  const button = page.getByRole('button', { name: expectedText });
  await expect(button).toBeVisible({ timeout });
}

/**
 * Ensures a subscription exists (subscribes if not already subscribed).
 * Uses optimistic updates — no reload needed since subscribe hooks prevent duplicates.
 */
export async function ensureSubscribed(page: Page) {
  // Wait for any subscribe/unsubscribe button to appear first
  const anyButton = page.getByRole('button', { name: /subscribe/i }).first();
  await expect(anyButton).toBeVisible({ timeout: 10000 });

  if (await isSubscribed(page)) return;

  await clickSubscribeButton(page);
  await waitForSubscribeState(page, true, 15000);
}

/**
 * Ensures no subscription exists (unsubscribes if currently subscribed).
 * Uses optimistic updates — no reload needed since unsubscribe hooks handle duplicates.
 */
export async function ensureNotSubscribed(page: Page) {
  // Wait for any subscribe/unsubscribe button to appear first
  const anyButton = page.getByRole('button', { name: /subscribe/i }).first();
  await expect(anyButton).toBeVisible({ timeout: 10000 });

  if (!(await isSubscribed(page))) return;

  await clickSubscribeButton(page);
  await waitForSubscribeState(page, false, 15000);
}
