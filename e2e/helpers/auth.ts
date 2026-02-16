import { type Page, expect } from '@playwright/test';
import { generateTestMagicCode, createTestToken } from './magic-code-helper';
import { init } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables for admin SDK
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '869f3247-fd73-44fe-9b5f-caa541352f89';
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

let _adminDB: ReturnType<typeof init> | null = null;
function getAdminDB() {
  if (!_adminDB) {
    _adminDB = init({ appId: APP_ID, adminToken: ADMIN_TOKEN! });
  }
  return _adminDB;
}

/**
 * Authentication helper utilities for E2E tests
 */

export const TEST_USERS = {
  main: {
    email: 'polity.live@gmail.com',
  },
  tobias: {
    email: 'tobias-test@polity.app',
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
  await page.waitForLoadState('domcontentloaded');

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
  await loginWithToken(page, TEST_USERS.main.email);
}

/**
 * Authenticates by injecting an auth token directly into IndexedDB.
 * This avoids the magic code race condition when multiple workers
 * generate codes for the same email simultaneously.
 */
export async function loginWithToken(page: Page, email: string) {
  const adminDB = getAdminDB();

  // Create a token (doesn't invalidate other tokens - no race condition)
  const token = await adminDB.auth.createToken(email);

  // Get user info
  const user = await adminDB.auth.getUser({ email });

  const dbName = `instant_${APP_ID}_5`;

  // Navigate to /auth — this page never redirects, so the evaluate
  // will always run on a fully-loaded page at the correct origin.
  await page.goto('/auth', { waitUntil: 'domcontentloaded' });

  // Inject auth token directly into IndexedDB
  await page.evaluate(
    async ({ dbName, userData }) => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('kv')) {
            db.createObjectStore('kv');
          }
        };
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = db.transaction(['kv'], 'readwrite');
          const store = tx.objectStore('kv');
          store.put(JSON.stringify(userData), 'currentUser');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    },
    {
      dbName,
      userData: {
        id: user.id,
        email: user.email,
        refresh_token: token,
      },
    }
  );

  // Navigate to a protected page — InstantDB will pick up the token from IndexedDB
  await page.goto('/notifications', { waitUntil: 'domcontentloaded' });

  // Verify auth succeeded — if still redirected to /auth, retry once with a fresh token
  try {
    await page.waitForURL(/\/notifications/, { timeout: 5000 });
  } catch {
    // Retry: create a new token and re-inject
    const retryToken = await adminDB.auth.createToken(email);
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      async ({ dbName, userData }) => {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(dbName, 1);
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction(['kv'], 'readwrite');
            const store = tx.objectStore('kv');
            store.put(JSON.stringify(userData), 'currentUser');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
          request.onerror = () => reject(request.error);
        });
      },
      {
        dbName,
        userData: {
          id: user.id,
          email: user.email,
          refresh_token: retryToken,
        },
      }
    );
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  }
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
