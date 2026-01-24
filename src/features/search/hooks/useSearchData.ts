import { useMemo } from 'react';
import db from '../../../../db/db';

export function useSearchData(
  cursors: {
    users?: { after?: string; first: number };
    groups?: { after?: string; first: number };
    statements?: { after?: string; first: number };
    todos?: { after?: string; first: number };
    blogs?: { after?: string; first: number };
    amendments?: { after?: string; first: number };
    events?: { after?: string; first: number };
  } = {
    users: { first: 20 },
    groups: { first: 20 },
    statements: { first: 20 },
    todos: { first: 20 },
    blogs: { first: 20 },
    amendments: { first: 20 },
    events: { first: 20 },
  }
) {
  const { user } = db.useAuth();
  const { data, isLoading, pageInfo } = db.useQuery({
    $users: {
      $: {
        where: {
          or: [{ visibility: 'public' }, { visibility: 'authenticated' }],
        },
        ...cursors.users,
      },
      hashtags: {}, // Load hashtags for users
    },
    groups: {
      $: cursors.groups,
      owner: {},
      hashtags: {},
      memberships: {
        user: {},
        role: {}, // Load role for displaying actual member role
      },
    },
    statements: {
      $: cursors.statements,
      user: {},
    },
    blogs: {
      $: cursors.blogs,
      hashtags: {},
      blogRoleBloggers: {
        user: {},
        role: {},
      },
      votes: {
        user: {},
      },
      comments: {},
    },
    amendments: {
      $: cursors.amendments,
      hashtags: {},
      amendmentRoleCollaborators: {
        user: {},
        role: {},
      },
      votes: {
        user: {},
      },
      groupSupporters: {
        memberships: {},
      },
    },
    events: {
      $: cursors.events,
      organizer: {},
      group: {},
      participants: {
        user: {}, // Load user info to match current user
      },
      hashtags: {},
    },
  });

  const { data: membershipsData, isLoading: membershipsLoading } = db.useQuery(
    user?.id
      ? {
          groupMemberships: {
            $: {
              where: { 'user.id': user.id },
            },
            group: {},
          },
        }
      : null
  );

  const { data: assignmentsData, isLoading: assignmentsLoading } = db.useQuery(
    user?.id
      ? {
          todoAssignments: {
            $: {
              where: { 'user.id': user.id },
            },
            todo: { group: {}, creator: {}, assignments: { user: {} } },
            user: {},
          },
        }
      : null
  );

  const memberGroupIds = useMemo(
    () =>
      (membershipsData?.groupMemberships || [])
        .filter((membership: any) => membership.group)
        .map((membership: any) => membership.group.id),
    [membershipsData?.groupMemberships]
  );

  const assignedTodoIds = useMemo(
    () =>
      (assignmentsData?.todoAssignments || [])
        .filter((assignment: any) => assignment.todo)
        .map((assignment: any) => assignment.todo.id),
    [assignmentsData?.todoAssignments]
  );

  const todoWhere = useMemo(() => {
    if (!user?.id) return null;
    const conditions: Array<Record<string, unknown>> = [];
    if (assignedTodoIds.length > 0) {
      conditions.push({ id: { in: assignedTodoIds } });
    }
    if (memberGroupIds.length > 0) {
      conditions.push({ 'group.id': { in: memberGroupIds } });
    }
    return conditions.length > 0 ? { or: conditions } : null;
  }, [assignedTodoIds, memberGroupIds, user?.id]);

  const { data: todosData, isLoading: todosLoading } = db.useQuery(
    todoWhere
      ? {
          todos: {
            $: {
              where: todoWhere,
              ...cursors.todos,
            },
            group: {},
            creator: {},
            assignments: { user: {} },
          },
        }
      : null
  );

  const combinedData = useMemo(
    () => ({
      ...data,
      todos: todosData?.todos || [],
    }),
    [data, todosData?.todos]
  );

  return {
    data: combinedData,
    isLoading: isLoading || membershipsLoading || assignmentsLoading || todosLoading,
    currentUserId: user?.id,
    pageInfo,
  };
}
