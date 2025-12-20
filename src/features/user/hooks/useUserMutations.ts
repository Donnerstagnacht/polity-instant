import { useState } from 'react';
import { db, tx, id } from '../../../../db/db';
import { toast } from 'sonner';

/**
 * Hook for user update mutations
 * Handles updating user profile data in Instant DB
 */
export function useUserMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user profile information
   */
  const updateUserProfile = async (
    userId: string,
    profileData: {
      name?: string;
      subtitle?: string;
      about?: string;
      avatar?: string;
      contactEmail?: string;
      contactTwitter?: string;
      contactWebsite?: string;
      contactLocation?: string;
      whatsapp?: string;
      instagram?: string;
      twitter?: string;
      facebook?: string;
      snapchat?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await db.transact([
        tx.$users[userId].update({
          ...profileData,
          updatedAt: new Date(),
        }),
      ]);

      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
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
      await db.transact([tx.$users[userId].link({ avatarFile: fileId })]);
      toast.success('Avatar updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update avatar';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const transactions = hashtags.map(tag => {
        const hashtagId = id();
        return [
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ user: userId }),
        ];
      }).flat();

      await db.transact(transactions);
      toast.success('Hashtags added successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add hashtags';
      setError(errorMessage);
      toast.error(errorMessage);
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
      await db.transact([tx.hashtags[hashtagId].delete()]);
      toast.success('Hashtag removed successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove hashtag';
      setError(errorMessage);
      toast.error(errorMessage);
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
      name?: string;
      subtitle?: string;
      about?: string;
      avatar?: string;
      contactEmail?: string;
      contactTwitter?: string;
      contactWebsite?: string;
      contactLocation?: string;
      whatsapp?: string;
      instagram?: string;
      twitter?: string;
      facebook?: string;
      snapchat?: string;
      hashtags?: string[];
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const transactions: any[] = [
        tx.$users[userId].update({
          name: profileData.name,
          subtitle: profileData.subtitle,
          about: profileData.about,
          avatar: profileData.avatar,
          contactEmail: profileData.contactEmail,
          contactTwitter: profileData.contactTwitter,
          contactWebsite: profileData.contactWebsite,
          contactLocation: profileData.contactLocation,
          whatsapp: profileData.whatsapp,
          instagram: profileData.instagram,
          twitter: profileData.twitter,
          facebook: profileData.facebook,
          snapchat: profileData.snapchat,
          updatedAt: new Date(),
        }),
      ];

      // Add hashtags if provided
      if (profileData.hashtags && profileData.hashtags.length > 0) {
        profileData.hashtags.forEach(tag => {
          const hashtagId = id();
          transactions.push(
            tx.hashtags[hashtagId].update({
              tag,
              createdAt: new Date(),
            }),
            tx.hashtags[hashtagId].link({ user: userId })
          );
        });
      }

      await db.transact(transactions);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
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
