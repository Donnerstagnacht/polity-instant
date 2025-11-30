import { type Page, expect } from '@playwright/test';

/**
 * Subscription helper utilities for E2E tests
 */

/**
 * Navigates to a user's profile page
 */
export async function navigateToUserProfile(page: Page, userId: string) {
  await page.goto(`/user/${userId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigates to a group page
 */
export async function navigateToGroup(page: Page, groupId: string) {
  await page.goto(`/group/${groupId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigates to an event page
 */
export async function navigateToEvent(page: Page, eventId: string) {
  await page.goto(`/event/${eventId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigates to a blog page
 */
export async function navigateToBlog(page: Page, blogId: string) {
  await page.goto(`/blog/${blogId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigates to an amendment page
 */
export async function navigateToAmendment(page: Page, amendmentId: string) {
  await page.goto(`/amendment/${amendmentId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Finds and returns the subscribe/unsubscribe button
 */
export async function getSubscribeButton(page: Page) {
  // Try multiple selectors to find the subscribe button
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
  // Look for subscriber count in various formats
  const subscriberElement = page.locator('text=/\\d+\\s*subscriber/i').first();

  try {
    const text = await subscriberElement.textContent({ timeout: 2000 });
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    // If not found, return 0
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
