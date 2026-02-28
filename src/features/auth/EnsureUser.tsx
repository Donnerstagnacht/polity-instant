'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUserState } from '@/zero/users/useUserState';
import { GlobalLoadingAnimation } from '@/features/shared/ui/ui/global-loading-animation';
import { useConnectionState } from '@rocicorp/zero/react';

interface EnsureUserProps {
  children: ReactNode;
}

const ZERO_SYNC_TIMEOUT_MS = 8000;

/**
 * EnsureUser component ensures that every authenticated user has a user record.
 * Queries Zero for the user record and shows a loading state until ready.
 * Times out after ZERO_SYNC_TIMEOUT_MS to avoid infinite loading when Zero can't sync.
 */
export function EnsureUser({ children }: EnsureUserProps) {
  const { user, loading } = useAuth();
  const { currentUser, isLoading: userStateLoading } = useUserState();
  const connectionState = useConnectionState();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!userStateLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), ZERO_SYNC_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [userStateLoading]);

  const isLoading = loading || (user?.id ? userStateLoading && !timedOut : false);

  if (isLoading) {
    const status =
      connectionState.name === 'connected'
        ? 'syncing' as const
        : connectionState.name === 'disconnected'
          ? 'disconnected' as const
          : 'connecting' as const;

    return <GlobalLoadingAnimation connectionStatus={status} />;
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
