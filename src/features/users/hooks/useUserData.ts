import { useUserState } from '@/zero/users/useUserState';
import type { UserProfile } from '../types/user.types';

/**
 * Hook to fetch user profile data from Zero.
 * Returns the raw FullProfileRow directly — no transformation layer.
 */
export function useUserData(userId?: string) {
  const { fullProfile, isLoading } = useUserState({ userId, includeFullProfile: true });

  const user: UserProfile | null =
    userId && fullProfile.length > 0 ? fullProfile[0] : null;

  return {
    user,
    userId,
    isLoading,
    error: null,
  };
}
