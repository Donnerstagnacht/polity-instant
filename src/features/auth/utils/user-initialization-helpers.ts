/**
 * User Initialization Helpers
 * Utilities for initializing new user records
 */

import { tx } from '../../../../db/db';

/**
 * Adjectives for random handle generation
 */
const HANDLE_ADJECTIVES = [
  'Quick',
  'Lazy',
  'Happy',
  'Sad',
  'Bright',
  'Dark',
  'Clever',
  'Bold',
  'Swift',
  'Calm',
  'Wise',
  'Brave',
  'Noble',
  'Silent',
  'Wild',
] as const;

/**
 * Nouns for random handle generation
 */
const HANDLE_NOUNS = [
  'Fox',
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Mouse',
  'Lion',
  'Bear',
  'Wolf',
  'Eagle',
  'Hawk',
  'Deer',
  'Owl',
  'Tiger',
  'Panda',
] as const;

/**
 * Generate a random handle for a new user
 * Format: AdjectiveNoun#### (e.g., QuickFox1234)
 * 
 * @returns A randomly generated handle
 */
export function generateRandomHandle(): string {
  const adjective = HANDLE_ADJECTIVES[Math.floor(Math.random() * HANDLE_ADJECTIVES.length)];
  const noun = HANDLE_NOUNS[Math.floor(Math.random() * HANDLE_NOUNS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  const handle = `${adjective}${noun}${number}`;
  console.log('🎲 Generated random handle:', handle);
  
  return handle;
}

/**
 * Build transactions to initialize a new user record
 * Sets the user's name, handle, and timestamps
 * 
 * @param userId - The ID of the user to initialize
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param handle - Optional handle (if not provided, generates a random one)
 * @returns Array of transactions to be executed
 */
export function buildUserInitializationTransactions(
  userId: string,
  firstName: string,
  lastName: string,
  handle?: string
): any[] {
  const fullName = `${firstName.trim()} ${lastName.trim()}`;
  const userHandle = handle || generateRandomHandle();
  const now = Date.now();

  console.log('👤 Building user initialization transactions:', {
    userId,
    fullName,
    handle: userHandle,
  });

  const transactions = [
    tx.$users[userId].update({
      handle: userHandle,
      name: fullName,
      updatedAt: now,
      lastSeenAt: now,
    }),
  ];

  console.log('✅ Built user initialization transactions');

  return transactions;
}
