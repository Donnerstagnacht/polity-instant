'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUserState } from '@/zero/users/useUserState';
import { Loader2 } from 'lucide-react';

interface EnsureUserProps {
  children: ReactNode;
}

/**
 * EnsureUser component ensures that every authenticated user has a user record.
 * Queries Zero for the user record and shows a loading state until ready.
 */
export function EnsureUser({ children }: EnsureUserProps) {
  const { user, loading } = useAuth();
  const { currentUser, isLoading: userStateLoading } = useUserState();

  const isLoading = loading || (user?.id ? userStateLoading : false);

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

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to get the current authenticated user with Zero data
 */
export function useUser() {
  const { user, loading } = useAuth();
  const { currentUser, isLoading: userStateLoading } = useUserState();

  const isLoading = loading || (user?.id ? userStateLoading : false);

  return {
    user: currentUser || user,
    isLoading,
    error: null,
  };
}

/**
 * Hook to get the current user (throws error if not found)
 * Must be used within EnsureUser component
 */
export function useRequiredUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useRequiredUser must be used inside EnsureUser');
  }
  return user;
}
