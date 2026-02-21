import { useState } from 'react';
import { useUserActions } from '@/zero/users/useUserActions';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

/**
 * Hook for user update mutations
 * Handles updating user profile data via Zero
 */
export function useUserMutations() {
  const userActions = useUserActions();
  const commonActions = useCommonActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user profile information
   */
  const updateUserProfile = async (
    userId: string,
    profileData: {
      first_name?: string;
      last_name?: string;
      bio?: string;
      about?: string;
      avatar?: string;
      x?: string;
      youtube?: string;
      linkedin?: string;
      website?: string;
      location?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await userActions.updateProfile({
        ...profileData,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Failed to update profile:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Link avatar file to user
   */
  const linkAvatarFile = async (userId: string, fileId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await userActions.updateProfile({
        avatar: fileId,
      });

      await createTimelineEvent({ data: {
          eventType: 'image_uploaded',
          entityType: 'user',
          entityId: userId,
          actorId: userId,
          title: 'Avatar updated',
          description: 'User uploaded a new profile image',
          contentType: 'image',
          status: {},
        } });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update avatar';
      setError(errorMessage);
      console.error('Failed to link avatar:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add hashtags to user
   */
  const addHashtags = async (userId: string, hashtags: string[]) => {
    if (hashtags.length === 0) return { success: true };

    setIsLoading(true);
    setError(null);

    try {
      for (const tag of hashtags) {
        const hashtagId = crypto.randomUUID();
        await commonActions.addHashtag({
          id: hashtagId,
          tag,
          category: '',
          color: '',
          bg_color: '',
          icon: '',
          description: '',
          amendment_id: '',
          event_id: '',
          group_id: '',
          blog_id: '',
          user_id: userId,
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add hashtags';
      setError(errorMessage);
      console.error('Failed to add hashtags:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove hashtag from user
   */
  const removeHashtag = async (hashtagId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await commonActions.deleteHashtag({ id: hashtagId });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove hashtag';
      setError(errorMessage);
      console.error('Failed to remove hashtag:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user with complete profile data including hashtags
   */
  const updateCompleteProfile = async (
    userId: string,
    profileData: {
      first_name?: string;
      last_name?: string;
      bio?: string;
      about?: string;
      avatar?: string;
      x?: string;
      youtube?: string;
      linkedin?: string;
      website?: string;
      location?: string;
      hashtags?: string[];
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await userActions.updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        bio: profileData.bio,
        about: profileData.about,
        avatar: profileData.avatar,
        x: profileData.x,
        youtube: profileData.youtube,
        linkedin: profileData.linkedin,
        website: profileData.website,
        location: profileData.location,
      });

      // Add hashtags if provided
      if (profileData.hashtags && profileData.hashtags.length > 0) {
        for (const tag of profileData.hashtags) {
          const hashtagId = crypto.randomUUID();
          await commonActions.addHashtag({
            id: hashtagId,
            tag,
            category: '',
            color: '',
            bg_color: '',
            icon: '',
            description: '',
            amendment_id: '',
            event_id: '',
            group_id: '',
            blog_id: '',
            user_id: userId,
          });
        }
      }

      // Add timeline event for profile update
      await createTimelineEvent({ data: {
          eventType: 'updated',
          entityType: 'user',
          entityId: userId,
          actorId: userId,
          title: profileData.first_name ? `${profileData.first_name}${profileData.last_name ? ' ' + profileData.last_name : ''} updated their profile` : 'Profile updated',
          description: profileData.about?.substring(0, 100) || undefined,
        } });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Failed to update complete profile:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    linkAvatarFile,
    addHashtags,
    removeHashtag,
    updateCompleteProfile,
    isLoading,
    error,
  };
}
