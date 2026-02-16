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
export async function waitForSubscribeState(page: Page, subscribed: boolean, timeout = 5000) {
  const expectedText = subscribed ? /unsubscribe/i : /^subscribe$/i;
  const button = page.getByRole('button', { name: expectedText });
  await expect(button).toBeVisible({ timeout });
}

/**
 * Ensures a subscription exists (subscribes if not already subscribed)
 */
export async function ensureSubscribed(page: Page) {
  const subscribed = await isSubscribed(page);
  if (!subscribed) {
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, true);
  }
}

/**
 * Ensures no subscription exists (unsubscribes if currently subscribed)
 */
export async function ensureNotSubscribed(page: Page) {
  const subscribed = await isSubscribed(page);
  if (subscribed) {
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, false);
  }
}
