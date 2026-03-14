import { useState, useMemo } from 'react';
import { useUserState } from '@/zero/users/useUserState';
import { useUserActions } from '@/zero/users/useUserActions';
import { useAuth } from '@/providers/auth-provider';
import { notifyNewFollower } from '@/features/notifications/utils/notification-helpers.ts';

/**
 * Hook to handle user following functionality
 * @param targetUserId - The ID of the user to follow/unfollow
 */
export function useFollowUser(targetUserId?: string) {
  const { user: authUser } = useAuth();
  const userActions = useUserActions();
  const [isLoading, setIsLoading] = useState(false);

  // Query followers for the target user via facade
  const { followers } = useUserState({ userId: targetUserId });

  // Derive isFollowing from followers list
  const isFollowing = useMemo(
    () => !!authUser?.id && followers.some((f: any) => f.follower_id === authUser.id),
    [followers, authUser?.id]
  );

  const followerCount = followers.length;

  // Find the current user's follow record (needed for unfollow)
  const currentFollowRecord = useMemo(
    () => authUser?.id ? followers.find((f: any) => f.follower_id === authUser.id) : undefined,
    [followers, authUser?.id]
  );

  // Follow a user
  const follow = async () => {
    if (!authUser?.id || !targetUserId || authUser.id === targetUserId) {
      return;
    }

    setIsLoading(true);
    try {
      const followId = crypto.randomUUID();
      await userActions.follow({
        id: followId,
        followee_id: targetUserId,
      });

      // Send notification to the user being followed
      const notificationTxs = notifyNewFollower({
        senderId: authUser.id,
        recipientUserId: targetUserId,
        senderName: authUser.email?.split('@')[0] || 'Someone',
      });
      // Notifications are sent separately — best-effort
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unfollow a user
  const unfollow = async () => {
    if (!authUser?.id || !targetUserId || !currentFollowRecord) {
      return;
    }

    setIsLoading(true);
    try {
      await userActions.unfollow(currentFollowRecord.id);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle follow/unfollow
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  };

  return {
    isFollowing,
    followerCount,
    isLoading,
    follow,
    unfollow,
    toggleFollow,
    canFollow: authUser?.id && targetUserId && authUser.id !== targetUserId,
  };
}
