import { useMemo } from 'react';
import { db } from '../../../../db/db';

/**
 * Fetches the IDs of all entities the user is associated with,
 * then queries only the notifications relevant to that user:
 * - Personal notifications (where user is the direct recipient)
 * - Entity notifications (for groups/events/amendments/blogs the user belongs to)
 *
 * This avoids fetching ALL notifications in the database and filtering client-side.
 */
export function useUserNotifications() {
  const { user } = db.useAuth();

  // Step 1: Get all entity IDs the user is associated with
  const { data: membershipData, isLoading: membershipLoading } = db.useQuery(
    user?.id
      ? {
          groupMemberships: {
            $: { where: { 'user.id': user.id } },
            group: {},
          },
          eventParticipants: {
            $: { where: { 'user.id': user.id } },
            event: {},
          },
          amendmentCollaborators: {
            $: { where: { 'user.id': user.id } },
            amendment: {},
          },
          blogBloggers: {
            $: { where: { 'user.id': user.id } },
            blog: {},
          },
        }
      : null
  );

  // Extract entity IDs
  const entityIds = useMemo(() => {
    if (!membershipData) return null;
    return {
      groupIds: (membershipData.groupMemberships ?? [])
        .map((m: any) => m.group?.id)
        .filter(Boolean) as string[],
      eventIds: (membershipData.eventParticipants ?? [])
        .map((p: any) => p.event?.id)
        .filter(Boolean) as string[],
      amendmentIds: (membershipData.amendmentCollaborators ?? [])
        .map((c: any) => c.amendment?.id)
        .filter(Boolean) as string[],
      blogIds: (membershipData.blogBloggers ?? [])
        .map((b: any) => b.blog?.id)
        .filter(Boolean) as string[],
    };
  }, [membershipData]);

  // Step 2: Build the OR conditions for the where clause
  const orConditions = useMemo(() => {
    if (!user?.id || !entityIds) return null;

    const conditions: any[] = [
      { 'recipient.id': user.id },
    ];

    if (entityIds.groupIds.length > 0) {
      conditions.push({ 'recipientGroup.id': { $in: entityIds.groupIds } });
    }
    if (entityIds.eventIds.length > 0) {
      conditions.push({ 'recipientEvent.id': { $in: entityIds.eventIds } });
    }
    if (entityIds.amendmentIds.length > 0) {
      conditions.push({ 'recipientAmendment.id': { $in: entityIds.amendmentIds } });
    }
    if (entityIds.blogIds.length > 0) {
      conditions.push({ 'recipientBlog.id': { $in: entityIds.blogIds } });
    }

    return conditions;
  }, [user?.id, entityIds]);

  // Derive a stable where clause
  const whereClause = useMemo(() => {
    if (!orConditions) return undefined;
    return orConditions.length > 1
      ? { or: orConditions }
      : orConditions[0];
  }, [orConditions]);

  // Step 3: Query notifications with the filtered where clause
  const { data, isLoading: notificationsLoading } = db.useQuery(
    user?.id && whereClause
      ? {
          notifications: {
            $: {
              where: whereClause,
              order: {
                serverCreatedAt: 'desc' as const,
              },
            },
            recipient: {},
            sender: {},
            relatedUser: {},
            relatedGroup: {},
            relatedEvent: {},
            relatedAmendment: {},
            relatedBlog: {},
            onBehalfOfGroup: {},
            onBehalfOfEvent: {},
            onBehalfOfAmendment: {},
            onBehalfOfBlog: {},
            recipientGroup: {
              memberships: {
                $: {
                  where: { 'user.id': user.id },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientEvent: {
              participants: {
                $: {
                  where: { 'user.id': user.id },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientAmendment: {
              amendmentRoleCollaborators: {
                $: {
                  where: { 'user.id': user.id },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientBlog: {
              blogRoleBloggers: {
                $: {
                  where: { 'user.id': user.id },
                },
                role: {
                  actionRights: {},
                },
              },
            },
          },
        }
      : null
  );

  return {
    data,
    isLoading: membershipLoading || notificationsLoading,
    userId: user?.id,
  };
}
