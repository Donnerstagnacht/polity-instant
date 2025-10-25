'use client';

import { useEffect, useState, ReactNode } from 'react';
import { db, tx, id } from '../../../db';
import { Loader2 } from 'lucide-react';

interface EnsureProfileProps {
  children: ReactNode;
}

/**
 * Generates a random handle for a new user profile
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
 * Creates a new profile for a user
 */
async function createProfile(userId: string, email: string): Promise<void> {
  const profileId = id();
  const now = Date.now();

  // Create profile with initial values
  await db.transact([
    tx.profiles[profileId].update({
      handle: randomHandle(),
      name: email.split('@')[0], // Use email username as initial name
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    }),
    // Link profile to user
    tx.profiles[profileId].link({ user: userId }),
  ]);

  console.log('✅ Profile created for user:', userId);
}

/**
 * EnsureProfile component ensures that every authenticated user has a profile.
 * If a profile doesn't exist, it creates one automatically.
 *
 * This component should wrap your main app content to ensure profiles are created
 * for new users during the magic auth sign-up flow.
 */
export function EnsureProfile({ children }: EnsureProfileProps) {
  const { user } = db.useAuth();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Query the user's profile
  const {
    data: profileData,
    isLoading,
    error,
  } = db.useQuery({
    profiles: {
      $: { where: { 'user.id': user?.id } },
    },
  });

  const profile = profileData?.profiles?.[0];

  // Create profile if it doesn't exist
  useEffect(() => {
    if (!user || isLoading || profile || isCreatingProfile) return;

    // Profile doesn't exist, create it
    const createUserProfile = async () => {
      setIsCreatingProfile(true);
      try {
        await createProfile(user.id, user.email || '');
      } catch (err) {
        console.error('Failed to create profile:', err);
      } finally {
        setIsCreatingProfile(false);
      }
    };

    createUserProfile();
  }, [user, isLoading, profile, isCreatingProfile]);

  // Show loading state while checking/creating profile
  if (isLoading || isCreatingProfile || (!profile && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">
            {isCreatingProfile ? 'Setting up your profile...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if profile query failed
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <p className="font-semibold text-red-900 dark:text-red-100">Profile Error</p>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  // Profile exists, render children
  return <>{children}</>;
}

/**
 * Hook to get the current user's profile
 * Must be used within EnsureProfile component
 */
export function useProfile() {
  const { user } = db.useAuth();
  const { data, isLoading, error } = db.useQuery(
    user?.id
      ? {
          profiles: {
            $: { where: { 'user.id': user.id } },
            avatarFile: {},
          },
        }
      : null
  );
  const profile = data?.profiles?.[0];

  return { profile, isLoading, error };
}

/**
 * Hook to get the current user's profile (throws error if not found)
 * Must be used within EnsureProfile component
 */
export function useRequiredProfile() {
  const { profile } = useProfile();
  if (!profile) {
    throw new Error('useRequiredProfile must be used inside EnsureProfile');
  }
  return profile;
}
