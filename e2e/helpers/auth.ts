import { type Page, expect } from '@playwright/test';
import { generateTestMagicCode } from './magic-code-helper';

/**
 * Authentication helper utilities for E2E tests
 */

export const TEST_USERS = {
  main: {
    email: 'tobias.hassebrock@gmail.com',
  },
  tobias: {
    email: 'tobias.hassebrock@gmail.com',
  },
};

/**
 * Authenticates a user via magic link (email + OTP)
 *
 * @param page - Playwright page object
 * @param email - User email address
 * @param generateCode - Whether to generate a fresh magic code using admin SDK (default: true)
 */
export async function login(page: Page, email: string, generateCode = true) {
  // Navigate to auth page
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Enter email and request magic code
  await expect(page.getByRole('heading', { name: /sign in to polity/i })).toBeVisible();
  await page.getByRole('textbox', { name: /email address/i }).fill(email);

  // Click send code button and wait for navigation
  await Promise.all([
    page.waitForURL(/\/auth\/verify/, { timeout: 10000 }),
    page.getByRole('button', { name: /send.*code/i }).click(),
  ]);

  // Verify we're on the verification page
  await expect(page).toHaveURL(/\/auth\/verify/);
  await expect(page.getByRole('heading', { name: /enter.*code|verify/i })).toBeVisible();

  // Generate a fresh magic code using the admin SDK
  let code: string;
  if (generateCode) {
    code = await generateTestMagicCode(email);
  } else {
    // Fallback to default test code (might not work)
    code = '123456';
  }

  // Enter the 6-digit OTP code
  const codeDigits = code.split('');
  const inputs = page.locator('input[type="text"][inputmode="numeric"]');

  for (let i = 0; i < codeDigits.length; i++) {
    await inputs.nth(i).fill(codeDigits[i]);
  }

  // Wait for automatic verification and redirect
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're logged in
  await expect(page).toHaveURL('/');
}

/**
 * Logs in with the main test user
 */
export async function loginAsTestUser(page: Page) {
  await login(page, TEST_USERS.main.email);
}

/**
 * Logs in with the Tobias test user
 */
export async function loginAsTobias(page: Page) {
  await login(page, TEST_USERS.tobias.email);
}

/**
 * Logs out the current user
 */
export async function logout(page: Page) {
  // Navigate to a logout endpoint or clear cookies
  // Implementation depends on your auth system
  await page.context().clearCookies();
  await page.goto('/auth');
}

/**
 * Checks if the user is currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for user-specific elements or navigation items
  const userAvatar = page
    .locator('[role="button"]:has-text("@")')
    .or(page.locator('img[alt*="avatar"]'));

  try {
    await userAvatar.waitFor({ state: 'visible', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
