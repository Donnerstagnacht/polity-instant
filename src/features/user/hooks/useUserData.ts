import { useMemo } from 'react';
import { db } from '../../../../db';
import type { User } from '../types/user.types';

/**
 * Hook to fetch user data from Instant DB
 * @param userId - The ID of the user to fetch
 * @returns User data with loading and error states
 */
export function useUserData(userId?: string) {
  // Query user profile and related data
  const { data, isLoading, error } = db.useQuery(
    userId
      ? {
          profiles: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            avatarFile: {}, // Query the linked avatar file to get URL
            user: {
              stats: {},
              statements: {},
              blogs: {},
              amendments: {},
              memberships: {
                group: {},
              },
              hashtags: {}, // Add hashtags to the query
            },
          },
        }
      : null
  );

  // Only log when we actually have a userId to query
  if (userId) {
    console.log('👤 [useUserData] Query result:', {
      userId,
      hasData: !!data,
      profiles: data?.profiles,
      profileCount: data?.profiles?.length,
      isLoading,
      error,
    });
  }

  // Extract profile ID
  const profileId = useMemo(() => {
    if (!userId || !data?.profiles || data.profiles.length === 0) {
      return null;
    }
    return data.profiles[0].id;
  }, [data, userId]);

  // Transform Instant DB data to match User type
  const user: User | null = useMemo(() => {
    if (!userId) {
      // Don't log when userId is not provided - this is expected during loading
      return null;
    }

    if (!data?.profiles || data.profiles.length === 0) {
      console.log('❌ [useUserData] No profiles found for userId:', userId);
      return null;
    }

    const profile = data.profiles[0];
    const userData = profile.user;

    console.log('✅ [useUserData] Found profile data:', {
      profileName: profile.name,
      hasUserData: !!userData,
    });

    // Transform profile and related data
    return {
      name: profile.name || '',
      subtitle: profile.subtitle || '',
      // Use avatarFile URL if available, otherwise fall back to avatar string or imageURL
      avatar: profile.avatarFile?.url || profile.avatar || profile.imageURL || '',

      // Transform stats
      stats:
        userData?.stats?.map((stat: any) => ({
          label: stat.label,
          value: stat.value,
          unit: stat.unit,
        })) || [],

      // Contact information
      contact: {
        email: profile.contactEmail || '',
        twitter: profile.contactTwitter || '',
        website: profile.contactWebsite || '',
        location: profile.contactLocation || '',
      },

      // Social media
      socialMedia: {
        whatsapp: profile.whatsapp,
        instagram: profile.instagram,
        twitter: profile.twitter,
        facebook: profile.facebook,
        snapchat: profile.snapchat,
      },

      // About
      about: profile.about || '',

      // Transform statements
      statements:
        userData?.statements?.map((statement: any) => ({
          id: statement.id,
          text: statement.text,
          tag: statement.tag,
        })) || [],

      // Transform blogs
      blogs:
        userData?.blogs?.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          date: blog.date,
          likes: blog.likes,
          comments: blog.comments,
        })) || [],

      // Transform groups from memberships
      groups:
        userData?.memberships?.map((membership: any) => ({
          id: membership.group.id,
          name: membership.group.name,
          members: membership.group.memberCount,
          role: membership.role,
          description: membership.group.description,
          tags: membership.group.tags,
          amendments: membership.group.amendments,
          events: membership.group.events,
          abbr: membership.group.abbr,
        })) || [],

      // Transform amendments
      amendments:
        userData?.amendments?.map((amendment: any) => ({
          id: amendment.id,
          title: amendment.title,
          subtitle: amendment.subtitle,
          status: amendment.status,
          supporters: amendment.supporters,
          date: amendment.date,
          code: amendment.code,
          tags: amendment.tags,
        })) || [],

      // Transform hashtags
      hashtags:
        userData?.hashtags?.map((hashtag: any) => ({
          id: hashtag.id,
          tag: hashtag.tag,
        })) || [],
    };
  }, [data, userId]);

  return {
    user,
    profileId,
    isLoading,
    error: error ? String(error) : null,
  };
}
