/**
 * Magic Code Helper for E2E Tests
 *
 * This helper uses the Supabase Admin API to generate OTP codes
 * for testing purposes, bypassing the need to check email.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Generates a magic code (OTP) for testing.
 * Uses Supabase admin generateLink to get a token that can be verified.
 *
 * @param email - The email address to generate a code for
 * @returns The generated OTP code
 */
export async function generateTestMagicCode(email: string): Promise<string> {
  // Ensure the user exists in Supabase Auth
  await ensureUserActive(email);

  // Generate a magic link which includes a token
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) {
    throw new Error(`Failed to generate magic code for ${email}: ${error.message}`);
  }

  // Extract the OTP from the action link URL
  // The link format is: <redirect_url>#token_hash=<hash>&type=magiclink
  // For local Supabase, the OTP is available in the response
  const actionLink = data?.properties?.action_link ?? '';
  const url = new URL(actionLink);
  // The token is in the hash fragment or query params
  const token = url.searchParams.get('token') ?? data?.properties?.hashed_token ?? '';

  // For Supabase local dev, the OTP code is typically 6 digits
  // extracted from the email_otp property if available
  if (data?.properties?.email_otp) {
    return data.properties.email_otp;
  }

  // Fallback: return the hashed token (caller should use token-based verification)
  return token;
}

/**
 * Ensures a user is active in Supabase Auth
 * @param email - The email address
 */
async function ensureUserActive(email: string): Promise<void> {
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users?.users?.find(u => u.email === email);

    if (!existing) {
      // Create the user
      const { error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (error && !error.message?.includes('already been registered')) {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to ensure user is active:`, error);
    throw error;
  }
}

/**
 * Creates a session token for a user (alternative to magic code flow)
 * @param email - The email address to create a token for
 * @returns Authentication token hash
 */
export async function createTestToken(email: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) {
    throw new Error(`Failed to create test token for ${email}: ${error.message}`);
  }

  return data?.properties?.hashed_token ?? '';
}
