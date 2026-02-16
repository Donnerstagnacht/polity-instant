import { type Page, expect } from '@playwright/test';

/**
 * Navigation helper utilities for E2E tests
 */

/**
 * Navigates to the authenticated user's own profile
 */
export async function navigateToOwnProfile(page: Page) {
  await page.goto('/user');

  // Should redirect to /user/{userId}
  await page.waitForURL(/\/user\/[a-f0-9-]+/, { timeout: 5000 });
}

/**
 * Navigates to a specific user's profile by ID
 */
export async function navigateToUserProfile(page: Page, userId: string) {
  await page.goto(`/user/${userId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to the profile edit page
 */
export async function navigateToProfileEdit(page: Page) {
  await navigateToOwnProfile(page);

  // Edit link is in the sidebar navigation (icon-only)
  const editLink = page.locator('a[href*="/edit"]').first();

  await editLink.click();
  await expect(page).toHaveURL(/\/user\/[a-f0-9-]+\/edit/);
}

/**
 * Navigates to the subscriptions page
 */
export async function navigateToSubscriptions(page: Page, userId?: string) {
  if (userId) {
    await page.goto(`/user/${userId}/subscriptions`);
  } else {
    await navigateToOwnProfile(page);
    const subscriptionsLink = page.getByRole('link', { name: /subscription/i });
    await subscriptionsLink.click();
  }

  await expect(page).toHaveURL(/\/user\/[a-f0-9-]+\/subscriptions/);
}

/**
 * Navigates to a group page
 */
export async function navigateToGroup(page: Page, groupId: string) {
  await page.goto(`/group/${groupId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to an amendment page
 */
export async function navigateToAmendment(page: Page, amendmentId: string) {
  await page.goto(`/amendment/${amendmentId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a blog page
 */
export async function navigateToBlog(page: Page, blogId: string) {
  await page.goto(`/blog/${blogId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to an event page
 */
export async function navigateToEvent(page: Page, eventId: string) {
  await page.goto(`/event/${eventId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a statement page
 */
export async function navigateToStatement(page: Page, statementId: string) {
  await page.goto(`/statement/${statementId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a todo detail page
 */
export async function navigateToTodo(page: Page, todoId: string) {
  await page.goto(`/todos/${todoId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a meeting page
 */
export async function navigateToMeeting(page: Page, meetingId: string) {
  await page.goto(`/meet/${meetingId}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a group's operation page
 */
export async function navigateToGroupOperation(page: Page, groupId: string) {
  await page.goto(`/group/${groupId}/operation`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a group's documents page
 */
export async function navigateToGroupDocuments(page: Page, groupId: string) {
  await page.goto(`/group/${groupId}/editor`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates to a user's memberships page
 */
export async function navigateToUserMemberships(page: Page, userId?: string) {
  if (userId) {
    await page.goto(`/user/${userId}/memberships`);
  } else {
    await navigateToOwnProfile(page);
    const membershipsLink = page.getByRole('link', { name: /membership/i });
    await membershipsLink.click();
  }
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Navigates using the command palette (⌘K)
 */
export async function openCommandPalette(page: Page) {
  // Press Cmd+K or Ctrl+K depending on platform
  await page.keyboard.press('Meta+k');

  // Wait for command palette to open
  const commandInput = page
    .locator('[role="combobox"]')
    .or(page.locator('input[placeholder*="command"]'));
  await expect(commandInput).toBeVisible();

  return commandInput;
}
