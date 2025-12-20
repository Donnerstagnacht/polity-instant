import { useMemo } from 'react';
import db from '../../../../db/db';

/**
 * Hook to query group data with all related entities
 * @param groupId - The group ID to query
 */
export function useGroupData(groupId?: string) {
  // Query for group details with all relationships
  const { data, isLoading, error } = db.useQuery(
    groupId
      ? {
          groups: {
            $: { where: { id: groupId } },
            owner: {},
            conversation: {
              participants: {
                user: {},
              },
            },
            memberships: {
              user: {},
              role: {},
            },
            roles: {
              actionRights: {},
            },
            events: {},
            amendments: {},
          },
        }
      : null
  );

  const group = useMemo(() => data?.groups?.[0] || null, [data]);
  const memberships = useMemo(() => group?.memberships || [], [group]);
  const roles = useMemo(() => group?.roles || [], [group]);
  const events = useMemo(() => group?.events || [], [group]);
  const amendments = useMemo(() => group?.amendments || [], [group]);
  const conversation = useMemo(() => group?.conversation, [group]);

  // Calculate member statistics
  const memberStats = useMemo(() => {
    const stats = {
      total: memberships.length,
      members: 0,
      admins: 0,
      invited: 0,
      requested: 0,
    };

    memberships.forEach((membership: any) => {
      if (membership.status === 'member') stats.members++;
      if (membership.status === 'admin' || membership.role?.name === 'Board Member') stats.admins++;
      if (membership.status === 'invited') stats.invited++;
      if (membership.status === 'requested') stats.requested++;
    });

    return stats;
  }, [memberships]);

  return {
    group,
    memberships,
    roles,
    events,
    amendments,
    conversation,
    memberStats,
    isLoading,
    error,
  };
}

/**
 * Hook to query all memberships for a group with filtering
 * @param groupId - The group ID
 */
export function useGroupMemberships(groupId?: string) {
  const { data, isLoading } = db.useQuery(
    groupId
      ? {
          groupMemberships: {
            $: {
              where: {
                'group.id': groupId,
              },
            },
            user: {},
            role: {
              actionRights: {},
            },
          },
        }
      : null
  );

  const memberships = useMemo(() => data?.groupMemberships || [], [data]);

  // Separate memberships by status
  const {
    activeMemberships,
    invitedMemberships,
    requestedMemberships,
    pendingMemberships,
  } = useMemo(() => {
    const active: any[] = [];
    const invited: any[] = [];
    const requested: any[] = [];
    const pending: any[] = [];

    memberships.forEach((membership: any) => {
      if (membership.status === 'member' || membership.status === 'admin' || membership.role?.name === 'Board Member') {
        active.push(membership);
      } else if (membership.status === 'invited') {
        invited.push(membership);
        pending.push(membership);
      } else if (membership.status === 'requested') {
        requested.push(membership);
        pending.push(membership);
      }
    });

    return {
      activeMemberships: active,
      invitedMemberships: invited,
      requestedMemberships: requested,
      pendingMemberships: pending,
    };
  }, [memberships]);

  return {
    memberships,
    activeMemberships,
    invitedMemberships,
    requestedMemberships,
    pendingMemberships,
    isLoading,
  };
}

/**
 * Hook to query group roles
 * @param groupId - The group ID
 */
export function useGroupRoles(groupId?: string) {
  const { data, isLoading } = db.useQuery(
    groupId
      ? {
          roles: {
            $: {
              where: {
                'group.id': groupId,
                scope: 'group',
              },
            },
            actionRights: {},
          },
        }
      : null
  );

  const roles = useMemo(() => data?.roles || [], [data]);

  return {
    roles,
    isLoading,
  };
}

/**
 * Hook to search users for inviting to group
 */
export function useUserSearch(searchQuery: string) {
  const { data, isLoading } = db.useQuery(
    searchQuery.trim()
      ? {
          $users: {
            $: {
              where: {
                or: [
                  { name: { $like: `%${searchQuery}%` } },
                  { handle: { $like: `%${searchQuery}%` } },
                ],
              },
              limit: 20,
            },
          },
        }
      : null
  );

  const users = useMemo(() => data?.$users || [], [data]);

  return {
    users,
    isLoading,
  };
}
