'use client';

import { ReactNode } from 'react';
import { db } from '../../../db';
import { Loader2 } from 'lucide-react';

interface EnsureUserProps {
  children: ReactNode;
}

/**
 * EnsureUser component ensures that every authenticated user has a user record.
 * User initialization (profile setup and Aria & Kai conversation) is handled
 * automatically during the authentication flow in auth.ts.
 *
 * This component simply verifies the user record exists and shows a loading
 * state while the data is being fetched.
 */
export function EnsureUser({ children }: EnsureUserProps) {
  const { user } = db.useAuth();

  // Query the user data directly
  const { isLoading, error } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
    },
  });

  // Show loading state while fetching user record
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
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

  return { user: data?.$users?.[0], isLoading, error };
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
