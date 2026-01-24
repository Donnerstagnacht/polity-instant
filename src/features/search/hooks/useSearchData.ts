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
      memberships: {},
      collaborations: {},
    },
    groups: {
      $: cursors.groups,
      owner: {},
      hashtags: {},
      memberships: {
        user: {},
        role: {}, // Load role for displaying actual member role
      },
      events: {},
      amendments: {},
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
      changeRequests: {},
      groups: {},
    },
    events: {
      $: cursors.events,
      organizer: {},
      group: {},
      participants: {
        user: {}, // Load user info to match current user
      },
      hashtags: {},
      votingSessions: { election: {}, amendment: {} },
      targetedAmendments: {},
      eventPositions: { election: {} },
      scheduledElections: {},
      agendaItems: { election: {}, amendmentVote: {} },
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

  // Query timelineEvents for vote, election, video, image content types
  const { data: timelineEventsData, isLoading: timelineEventsLoading } = db.useQuery({
    timelineEvents: {
      $: {
        where: {
          contentType: { in: ['vote', 'election', 'video', 'image'] },
        },
        first: 50,
      },
      actor: {},
      group: {},
      event: {},
    },
  });

  const eventIds = useMemo(
    () => (data?.events || []).map((event: any) => event.id).filter(Boolean),
    [data?.events]
  );

  const { data: agendaItemsData, isLoading: agendaItemsLoading } = db.useQuery(
    eventIds.length > 0
      ? {
          agendaItems: {
            $: {
              where: { 'event.id': { in: eventIds } },
            },
            event: {},
            election: {},
            amendmentVote: {},
          },
        }
      : null
  );

  // Query elections directly for better search results
  const { data: electionsData, isLoading: electionsLoading } = db.useQuery({
    elections: {
      $: {
        first: 20,
      },
      position: {
        group: {},
      },
      candidates: {},
      agendaItem: {
        event: {},
      },
    },
  });

  // Query eventVotingSessions for votes
  const { data: votingSessionsData, isLoading: votingSessionsLoading } = db.useQuery({
    eventVotingSessions: {
      $: {
        first: 20,
      },
      event: {},
      votes: {
        voter: {},
      },
      election: {
        agendaItem: {
          event: {},
        },
      },
      amendment: {
        agendaItems: {
          event: {},
        },
      },
    },
  });

  const combinedData = useMemo(
    () => ({
      ...data,
      todos: todosData?.todos || [],
      timelineEvents: timelineEventsData?.timelineEvents || [],
      elections: electionsData?.elections || [],
      eventVotingSessions: votingSessionsData?.eventVotingSessions || [],
      agendaItems: agendaItemsData?.agendaItems || [],
    }),
    [
      data,
      todosData?.todos,
      timelineEventsData?.timelineEvents,
      electionsData?.elections,
      votingSessionsData?.eventVotingSessions,
      agendaItemsData?.agendaItems,
    ]
  );

  return {
    data: combinedData,
    isLoading:
      isLoading ||
      membershipsLoading ||
      assignmentsLoading ||
      todosLoading ||
      timelineEventsLoading ||
      electionsLoading ||
      votingSessionsLoading ||
      agendaItemsLoading,
    currentUserId: user?.id,
    pageInfo,
  };
}
