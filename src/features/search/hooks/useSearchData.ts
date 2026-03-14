import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useSearchState } from '@/zero/shared/useSearchState';

type Cursor = [string, string, any, number];

export function useSearchData(
  cursors: {
    users?: { after?: Cursor; first: number };
    groups?: { after?: Cursor; first: number };
    statements?: { after?: Cursor; first: number };
    todos?: { after?: Cursor; first: number };
    blogs?: { after?: Cursor; first: number };
    amendments?: { after?: Cursor; first: number };
    events?: { after?: Cursor; first: number };
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
  const { user } = useAuth();

  const searchState = useSearchState({
    userId: user?.id,
    limits: {
      users: cursors.users?.first ?? 20,
      groups: cursors.groups?.first ?? 20,
      statements: cursors.statements?.first ?? 20,
      blogs: cursors.blogs?.first ?? 20,
      amendments: cursors.amendments?.first ?? 20,
      events: cursors.events?.first ?? 20,
      todos: cursors.todos?.first ?? 20,
    },
  });

  const combinedData = useMemo(
    () => ({
      $users: searchState.users,
      groups: searchState.groups,
      statements: searchState.statements,
      blogs: searchState.blogs,
      amendments: searchState.amendments,
      events: (searchState.events ?? []).filter(e => !e.is_bookable),
      todos: searchState.todos,
      timelineEvents: searchState.timelineEvents,
      elections: searchState.elections,
      eventVotingSessions: searchState.eventVotingSessions,
      agendaItems: searchState.agendaItems,
    }),
    [
      searchState.users,
      searchState.groups,
      searchState.statements,
      searchState.blogs,
      searchState.amendments,
      searchState.events,
      searchState.todos,
      searchState.timelineEvents,
      searchState.elections,
      searchState.eventVotingSessions,
      searchState.agendaItems,
    ]
  );

  return {
    data: combinedData,
    isLoading: searchState.isLoading,
    currentUserId: user?.id,
    pageInfo: undefined,
  };
}
