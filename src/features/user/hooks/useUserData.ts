import { useMemo } from 'react';
import { db } from '../../../../db/db';
import type { User } from '../types/user.types';

/**
 * Hook to fetch user data from Instant DB
 * @param userId - The ID of the user to fetch
 * @returns User data with loading and error states
 */
export function useUserData(userId?: string) {
  // Query user data directly from $users
  const { data, isLoading, error } = db.useQuery(
    userId
      ? {
          $users: {
            $: {
              where: {
                id: userId,
              },
            },
            avatarFile: {}, // Query the linked avatar file to get URL
            stats: {},
            statements: {},
            memberships: {
              group: {
                events: {},
                amendments: {},
                hashtags: {},
              },
              role: {},
            },
            bloggerRelations: {
              blog: {
                hashtags: {},
              },
              role: {
                actionRights: {},
              },
            },
            hashtags: {}, // Add hashtags to the query
          },
        }
      : null
  );

  // Separate query for amendment collaborations
  const { data: collaborationsData } = db.useQuery(
    userId
      ? {
          amendmentCollaborators: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            amendment: {
              groups: {},
              hashtags: {},
            },
          },
        }
      : null
  );

  // Transform Instant DB data to match User type
  const user: User | null = useMemo(() => {
    if (!userId) {
      // Don't log when userId is not provided - this is expected during loading
      return null;
    }

    if (!data?.$users || data.$users.length === 0) {
      return null;
    }

    const userData = data.$users[0];

    // Transform user and related data
    return {
      id: userData.id, // Add the user ID!
      name: userData.name || '',
      subtitle: userData.subtitle || '',
      // Use avatarFile URL if available, otherwise fall back to avatar string or imageURL
      avatar: userData.avatarFile?.url || userData.avatar || userData.imageURL || '',

      // Transform stats
      stats:
        userData?.stats?.map((stat: any) => ({
          label: stat.label,
          value: stat.value,
          unit: stat.unit,
        })) || [],

      // Contact information
      contact: {
        email: userData.contactEmail || '',
        twitter: userData.contactTwitter || '',
        website: userData.contactWebsite || '',
        location: userData.contactLocation || '',
      },

      // Social media
      socialMedia: {
        whatsapp: userData.whatsapp,
        instagram: userData.instagram,
        twitter: userData.twitter,
        facebook: userData.facebook,
        snapchat: userData.snapchat,
      },

      // About
      about: userData.about || '',

      // Transform statements
      statements:
        userData?.statements?.map((statement: any) => ({
          id: statement.id,
          text: statement.text,
          tag: statement.tag,
        })) || [],

      // Transform blogs - only from blogger relations with update rights
      blogs:
        userData?.bloggerRelations
          ?.filter((relation: any) => {
            // Check if this blogger relation has a role with update rights for blogs
            const hasUpdateRight = relation.role?.actionRights?.some(
              (right: any) => right.resource === 'blogs' && right.action === 'update'
            );
            return hasUpdateRight && relation.blog;
          })
          ?.reduce((acc: any[], relation: any) => {
            // Deduplicate by blog ID
            const existingIndex = acc.findIndex(b => b.id === relation.blog.id);
            if (existingIndex === -1) {
              acc.push({
                id: relation.blog.id,
                title: relation.blog.title,
                date: relation.blog.date,
                description: relation.blog.description,
                imageURL: relation.blog.imageURL,
                commentCount: relation.blog.commentCount || 0,
                hashtags: relation.blog.hashtags,
                authorName: userData.name,
                authorAvatar:
                  userData.avatarFile?.url || userData.avatar || userData.imageURL || '',
              });
            }
            return acc;
          }, []) || [],

      // Transform groups from memberships
      groups:
        userData?.memberships
          ?.filter((membership: any) => membership.group) // Filter out memberships without group
          ?.reduce((acc: any[], membership: any) => {
            // Use membership ID as the primary key, but ensure uniqueness by checking if it already exists
            const existingIndex = acc.findIndex(g => g.id === membership.id);
            if (existingIndex === -1) {
              acc.push({
                id: membership.id, // Use membership ID to ensure uniqueness
                groupId: membership.group.id, // Keep the actual group ID for navigation
                name: membership.group.name,
                members: membership.group.memberCount,
                role: membership.role?.name || 'Member', // Default to 'Member' if role is undefined
                description: membership.group.description,
                tags: membership.group.tags,
                amendments: membership.group.amendments?.length,
                events: membership.group.events?.length,
                abbr: membership.group.abbr,
              });
            }
            return acc;
          }, []) || [],

      // Get amendments from collaborations instead (no direct user->amendments link)
      amendments:
        collaborationsData?.amendmentCollaborators?.reduce((acc: any[], collab: any) => {
          // Skip if amendment is undefined
          if (!collab.amendment) return acc;

          // Deduplicate by amendment ID
          const existingIndex = acc.findIndex(a => a.id === collab.amendment.id);
          if (existingIndex === -1) {
            acc.push({
              id: collab.amendment.id,
              title: collab.amendment.title,
              subtitle: collab.amendment.subtitle,
              status: collab.amendment.status,
              supporters: collab.amendment.supporters,
              date: collab.amendment.date,
              code: collab.amendment.code,
              tags: collab.amendment.hashtags?.map((tag: any) => tag.tag) || collab.amendment.tags,
              groupId: collab.amendment.groups?.[0]?.id,
              groupName: collab.amendment.groups?.[0]?.name,
            });
          }
          return acc;
        }, []) || [],

      // Transform hashtags
      hashtags:
        userData?.hashtags?.reduce((acc: any[], hashtag: any) => {
          // Deduplicate by hashtag ID
          const existingIndex = acc.findIndex(h => h.id === hashtag.id);
          if (existingIndex === -1) {
            acc.push({
              id: hashtag.id,
              tag: hashtag.tag,
            });
          }
          return acc;
        }, []) || [],

      // Count amendment collaborations (where user is admin or collaborator)
      amendmentCollaborationsCount:
        collaborationsData?.amendmentCollaborators?.filter(
          (collab: any) => collab.status === 'admin' || collab.status === 'collaborator'
        )?.length || 0,
    };
  }, [data, userId, collaborationsData]);

  return {
    user,
    userId: userId,
    isLoading,
    error: error ? (error instanceof Error ? error.message : JSON.stringify(error)) : null,
  };
}
