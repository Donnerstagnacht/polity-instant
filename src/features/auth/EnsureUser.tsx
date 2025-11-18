'use client';

import { useEffect, useState, ReactNode } from 'react';
import { db, tx } from '../../../db';
import { Loader2 } from 'lucide-react';

interface EnsureUserProps {
  children: ReactNode;
}

/**
 * Generates a random handle for a new user
 */
function randomHandle(): string {
  const adjectives = [
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
  ];
  const nouns = ['Fox', 'Dog', 'Cat', 'Bird', 'Fish', 'Mouse', 'Lion', 'Bear', 'Wolf', 'Eagle'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `${randomAdjective}${randomNoun}${randomSuffix}`;
}

/**
 * Updates user attributes
 */
async function createUser(userId: string, email: string): Promise<void> {
  const now = Date.now();

  // Update $users entity with user attributes
  await db.transact([
    tx.$users[userId].update({
      handle: randomHandle(),
      name: email.split('@')[0], // Use email username as initial name
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    }),
  ]);

  console.log('✅ User attributes updated for user:', userId);
}

/**
 * EnsureUser component ensures that every authenticated user has a user record.
 * If a user record doesn't exist, it creates one automatically.
 *
 * This component should wrap your main app content to ensure user records are created
 * for new users during the magic auth sign-up flow.
 */
export function EnsureUser({ children }: EnsureUserProps) {
  const { user } = db.useAuth();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Query the user data directly
  const {
    data: userData,
    isLoading,
    error,
  } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
    },
  });

  const userRecord = userData?.$users?.[0];

  // Create user record if it doesn't exist
  useEffect(() => {
    if (!user || isLoading || userRecord || isCreatingUser) return;

    // User record doesn't exist, create it
    const initializeUser = async () => {
      setIsCreatingUser(true);
      try {
        await createUser(user.id, user.email || '');
      } catch (err) {
        console.error('Failed to create user record:', err);
      } finally {
        setIsCreatingUser(false);
      }
    };

    initializeUser();
  }, [user, isLoading, userRecord, isCreatingUser]);

  // Show loading state while checking/creating user record
  if (isLoading || isCreatingUser || (!userRecord && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">
            {isCreatingUser ? 'Setting up your account...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if user record query failed
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <p className="font-semibold text-red-900 dark:text-red-100">User Record Error</p>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  // User record exists, render children
  return <>{children}</>;
}

/**
 * Hook to get the current user's user record
 * Must be used within EnsureUser component
 */
export function useUser() {
  const { user } = db.useAuth();
  const { data, isLoading, error } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: { where: { id: user.id } },
            avatarFile: {},
          },
        }
      : null
  );
  const userRecord = data?.$users?.[0];

  return { user: userRecord, isLoading, error };
}

/**
 * Hook to get the current user's user record (throws error if not found)
 * Must be used within EnsureUser component
 */
export function useRequiredUser() {
  const { user } = useUser();
  if (!user) {
    throw new Error('useRequiredUser must be used inside EnsureUser');
  }
  return user;
}
