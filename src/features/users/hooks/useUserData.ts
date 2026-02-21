import { useMemo } from 'react';
import { useUserState } from '@/zero/users/useUserState';
import type { User } from '../types/user.types';
import { transformUserData } from '../logic/transformUserData';

/**
 * Hook to fetch user data from Zero
 * @param userId - The ID of the user to fetch
 * @returns User data with loading and error states
 */
export function useUserData(userId?: string) {
  const { fullProfile, isLoading } = useUserState({ userId, includeFullProfile: true });

  const data = fullProfile;
  const error = null;

  const user: User | null = useMemo(() => {
    if (!userId) return null;
    if (!data || data.length === 0) return null;
    return transformUserData(data[0]);
  }, [data, userId]);

  return {
    user,
    userId: userId,
    isLoading,
    error: null,
  };
}
