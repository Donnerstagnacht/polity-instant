/**
 * Magic Code Helper for E2E Tests
 *
 * This helper uses the InstantDB Admin SDK to generate magic codes
 * for testing purposes, bypassing the need to check email.
 */

import { init } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN'
  );
}

// Initialize the admin SDK
const adminDB = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

/**
 * Generates a magic code for testing
 * @param email - The email address to generate a code for
 * @returns The generated magic code
 */
export async function generateTestMagicCode(email: string): Promise<string> {
  try {
    // First, ensure the user is active
    await ensureUserActive(email);

    const { code } = await adminDB.auth.generateMagicCode(email);
    console.log(`✅ Generated magic code for ${email}: ${code}`);
    return code;
  } catch (error) {
    console.error('❌ Failed to generate magic code:', error);
    throw error;
  }
}

/**
 * Ensures a user is active for testing
 * @param email - The email address
 */
async function ensureUserActive(email: string): Promise<void> {
  try {
    // Get or create the user
    let user;
    try {
      user = await adminDB.auth.getUser({ email });
      console.log(`ℹ️ Found existing user: ${email} (${user?.id})`);
    } catch (error: any) {
      // User doesn't exist, create them
      if (error?.message?.includes('not found') || error?.status === 404) {
        console.log(`ℹ️ Creating new user: ${email}`);
        const token = await adminDB.auth.createToken(email);
        user = await adminDB.auth.verifyToken(token);
        console.log(`✅ User created: ${email} (${user?.id})`);
      } else {
        throw error;
      }
    }

    // Update the user to be active
    if (user?.id) {
      await adminDB.transact([
        adminDB.tx.$users[user.id].update({
          isActive: true,
          updatedAt: new Date(),
        }),
      ]);
      console.log(`✅ User activated: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Failed to ensure user is active:`, error);
    throw error;
  }
}

/**
 * Creates a token for a user (alternative to magic code flow)
 * @param email - The email address to create a token for
 * @returns Authentication token
 */
export async function createTestToken(email: string): Promise<string> {
  try {
    const token = await adminDB.auth.createToken(email);
    console.log(`✅ Created auth token for ${email}`);
    return token;
  } catch (error) {
    console.error('❌ Failed to create token:', error);
    throw error;
  }
}

/**
 * Verifies a magic code (for debugging)
 * @param email - The email address
 * @param code - The magic code to verify
 * @returns User object with refresh token
 */
export async function verifyTestMagicCode(email: string, code: string) {
  try {
    const user = await adminDB.auth.verifyMagicCode(email, code);
    console.log(`✅ Verified magic code for ${email}`);
    return user;
  } catch (error) {
    console.error('❌ Failed to verify magic code:', error);
    throw error;
  }
}
