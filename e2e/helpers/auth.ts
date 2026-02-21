import { type Page, expect } from '@playwright/test';
import { generateTestMagicCode } from './magic-code-helper';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables for admin SDK
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _adminClient: ReturnType<typeof createClient> | null = null;
function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _adminClient;
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
 * Authenticates by setting a Supabase session via cookies/localStorage.
 * Uses the admin API to generate a magic link and extract the session token.
 */
export async function loginWithToken(page: Page, email: string) {
  const admin = getAdminClient();

  // Generate a magic link for the user
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkError || !linkData) {
    throw new Error(`Failed to generate magic link for ${email}: ${linkError?.message}`);
  }

  // Extract the token hash and use it to verify the OTP
  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error('No hashed_token returned from generateLink');
  }

  // Navigate to the app origin first so we can set storage on the correct domain
  await page.goto('/auth', { waitUntil: 'domcontentloaded' });

  // Use the Supabase verifyOtp endpoint to get a session, then inject it
  const verifyResponse = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      type: 'magiclink',
      token_hash: tokenHash,
    }),
  });

  if (!verifyResponse.ok) {
    throw new Error(`OTP verify failed: ${verifyResponse.status} ${await verifyResponse.text()}`);
  }

  const session = await verifyResponse.json();

  // Inject the session into localStorage so Supabase client picks it up
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  await page.evaluate(
    ({ key, sessionData }) => {
      localStorage.setItem(
        key,
        JSON.stringify(sessionData)
      );
    },
    {
      key: storageKey,
      sessionData: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user,
      },
    }
  );

  // Navigate to a protected page — Supabase will pick up the session from localStorage
  await page.goto('/notifications', { waitUntil: 'domcontentloaded' });

  // Verify auth succeeded
  try {
    await page.waitForURL(/\/notifications/, { timeout: 5000 });
  } catch {
    // Retry with a fresh token
    const { data: retryLink } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    const retryHash = retryLink?.properties?.hashed_token;
    if (retryHash) {
      const retryResponse = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          type: 'magiclink',
          token_hash: retryHash,
        }),
      });
      if (retryResponse.ok) {
        const retrySession = await retryResponse.json();
        await page.goto('/auth', { waitUntil: 'domcontentloaded' });
        await page.evaluate(
          ({ key, sessionData }) => {
            localStorage.setItem(key, JSON.stringify(sessionData));
          },
          {
            key: storageKey,
            sessionData: {
              access_token: retrySession.access_token,
              refresh_token: retrySession.refresh_token,
              expires_in: retrySession.expires_in,
              expires_at: retrySession.expires_at,
              token_type: retrySession.token_type,
              user: retrySession.user,
            },
          }
        );
        await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
      }
    }
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
  await page.context().clearCookies();
  // Clear Supabase session from localStorage
  await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('auth-token') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    }
  });
  await page.goto('/auth');
}

/**
 * Checks if the user is currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
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
