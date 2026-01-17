import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { notifyNewFollower } from '@/utils/notification-helpers';

/**
 * Hook to handle user following functionality
 * @param targetUserId - The ID of the user to follow/unfollow
 */
export function useFollowUser(targetUserId?: string) {
  const { user: authUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Query to check if current user is following the target user
  const { data: followData } = db.useQuery(
    authUser?.id && targetUserId
      ? {
          follows: {
            $: {
              where: {
                'follower.id': authUser.id,
                'followee.id': targetUserId,
              },
            },
          },
        }
      : { follows: {} }
  );

  // Query to get follower count for the target user
  const { data: followersData } = db.useQuery(
    targetUserId
      ? {
          follows: {
            $: {
              where: {
                'followee.id': targetUserId,
              },
            },
          },
        }
      : { follows: {} }
  );

  // Update following state when data changes
  useEffect(() => {
    if (followData?.follows) {
      setIsFollowing(followData.follows.length > 0);
    }
  }, [followData]);

  // Update follower count when data changes
  useEffect(() => {
    if (followersData?.follows) {
      setFollowerCount(followersData.follows.length);
    }
  }, [followersData]);

  // Follow a user
  const follow = async () => {
    if (!authUser?.id || !targetUserId || authUser.id === targetUserId) {
      return;
    }

    setIsLoading(true);
    try {
      const followId = id();
      const transactions: any[] = [
        tx.follows[followId].update({
          follower: authUser.id,
          followee: targetUserId,
          createdAt: new Date(),
        }),
      ];

      // Send notification to the user being followed
      const notificationTxs = notifyNewFollower({
        senderId: authUser.id,
        recipientUserId: targetUserId,
        senderName: authUser.name || 'Someone',
      });
      transactions.push(...notificationTxs);

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unfollow a user
  const unfollow = async () => {
    if (!authUser?.id || !targetUserId || !followData?.follows?.length) {
      return;
    }

    setIsLoading(true);
    try {
      const followId = followData.follows[0].id;
      await db.transact([tx.follows[followId].delete()]);
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
