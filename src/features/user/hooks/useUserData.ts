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
            user: {
              stats: {},
              statements: {},
              blogs: {},
              amendments: {},
              memberships: {
                group: {},
              },
            },
          },
        }
      : { profiles: {} }
  );

  // Transform Instant DB data to match User type
  const user: User | null = useMemo(() => {
    if (!data?.profiles || data.profiles.length === 0) {
      return null;
    }

    const profile = data.profiles[0];
    const userData = profile.user;

    // Transform profile and related data
    return {
      name: profile.name || '',
      subtitle: profile.subtitle || '',
      avatar: profile.avatar || profile.imageURL || '',

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
    };
  }, [data]);

  return {
    user,
    isLoading,
    error: error ? String(error) : null,
  };
}
