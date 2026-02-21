import { type Page, expect } from '@playwright/test';

/**
 * Navigation helper utilities for E2E tests
 */

/**
 * Navigates to a page and retries if "Access Denied" appears, page redirects away,
 * or entity is not found. Factory-created data may not be immediately available
 * to the client-side PermissionGuard due to sync delay.
 */
export async function gotoWithRetry(page: Page, url: string, retries = 8) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    // Progressive wait: give more time on later retries for slow sync under load
    const baseWait = 2000 + attempt * 500;
    await page.waitForTimeout(baseWait);

    // Check if we stayed on the expected URL (not redirected)
    const currentUrl = page.url();
    const expectedPath = url.startsWith('/') ? url : new URL(url).pathname;
    const isOnTarget = currentUrl.includes(expectedPath);

    if (!isOnTarget) {
      // Page was redirected (e.g., to notifications) — retry
      if (attempt < retries) {
        await page.waitForTimeout(1000);
        continue;
      }
      return;
    }

    // Wait for loading spinner to disappear (PermissionGuard shows Loader2 during loading)
    const spinner = page.locator('.animate-spin');
    await spinner.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

    // Check for error states after spinner resolves
    const accessDenied = page.getByText('Access Denied');
    const notFound = page.getByText(/not found/i);
    const hasDenied = await accessDenied.isVisible({ timeout: 1000 }).catch(() => false);
    const hasNotFound = await notFound.first().isVisible({ timeout: 1000 }).catch(() => false);

    if (!hasDenied && !hasNotFound) return; // Success

    if (attempt < retries) {
      await page.waitForTimeout(1000);
    }
  }
}

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
 * Navigates to the home page and dismisses the AriaKai Welcome dialog if it appears.
 * The dialog applies aria-hidden to the rest of the page, blocking role-based locators.
 */
export async function gotoHomeAndDismissDialog(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Dismiss the AriaKai Welcome dialog if it appears
  const closeButton = page.getByRole('button', { name: /I'll find you later|close/i }).first();
  await closeButton.click({ timeout: 5000 }).catch(() => {});
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
