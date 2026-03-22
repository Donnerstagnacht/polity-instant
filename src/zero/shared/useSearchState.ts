import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'
import { useAgendaState } from '../agendas/useAgendaState'
import { useElectionState } from '../elections/useElectionState'
import { useCommonState } from '../common/useCommonState'

export interface SearchLimits {
  users?: number
  groups?: number
  statements?: number
  blogs?: number
  amendments?: number
  events?: number
  todos?: number
  votingSessions?: number
}

export interface SearchOptions {
  userId?: string
  limits?: SearchLimits
}

export function useSearchState(options: SearchOptions = {}) {
  const { userId, limits = {} } = options
  const usersLimit = limits.users ?? 20
  const groupsLimit = limits.groups ?? 20
  const statementsLimit = limits.statements ?? 20
  const blogsLimit = limits.blogs ?? 20
  const amendmentsLimit = limits.amendments ?? 20
  const eventsLimit = limits.events ?? 20
  const todosLimit = limits.todos ?? 20
  const votingSessionsLimit = limits.votingSessions ?? 20

  // ── Basic entity queries ────────────────────────────────────────────
  const [users] = useQuery(queries.search.searchableUsers({ limit: usersLimit }))
  const [groups] = useQuery(queries.search.searchableGroups({ limit: groupsLimit }))
  const [statements] = useQuery(queries.search.searchableStatements({ limit: statementsLimit }))
  const [blogs] = useQuery(queries.search.searchableBlogs({ limit: blogsLimit }))
  const [amendments] = useQuery(queries.search.searchableAmendments({ limit: amendmentsLimit }))
  const [events] = useQuery(queries.search.searchableEvents({ limit: eventsLimit }))

  // ── User-specific queries ───────────────────────────────────────────
  const [groupMemberships] = useQuery(
    userId ? queries.search.userGroupMemberships({ user_id: userId }) : undefined
  )
  const [todoAssignments] = useQuery(
    userId ? queries.search.userTodoAssignments({ user_id: userId }) : undefined
  )

  // ── Derived: todo eligibility ───────────────────────────────────────
  const memberGroupIds = useMemo(
    () =>
      (groupMemberships ?? [])
        .filter(m => m.group)
        .map(m => m.group!.id),
    [groupMemberships]
  )

  const assignedTodoIds = useMemo(
    () =>
      (todoAssignments ?? [])
        .filter(a => a.todo)
        .map(a => a.todo!.id),
    [todoAssignments]
  )

  const hasTodoAccess = !!(userId && (assignedTodoIds.length > 0 || memberGroupIds.length > 0))

  const [todos] = useQuery(
    hasTodoAccess
      ? queries.search.searchableTodos({ limit: todosLimit })
      : undefined
  )

  // ── Timeline events (via common facade) ─────────────────────────────
  const { timelineByContentTypes: timelineEvents, allHashtags } = useCommonState({
    timelineContentTypes: ['vote', 'election', 'video', 'image'],
    timelineContentLimit: 50,
    loadAllHashtags: true,
  })

  // ── Event-derived queries ───────────────────────────────────────────
  const eventIds = useMemo(
    () => (events ?? []).map(e => e.id).filter(Boolean),
    [events]
  )

  const { agendaItems } = useAgendaState({
    eventIds: eventIds.length > 0 ? eventIds : undefined,
  })

  const { electionsForSearch: elections } = useElectionState({
    includeElectionsForSearch: true,
  })

  // TODO: Removed with voting session migration
  // searchableVotingSessions query no longer exists

  return {
    users: users ?? [],
    groups: groups ?? [],
    statements: statements ?? [],
    blogs: blogs ?? [],
    amendments: amendments ?? [],
    events: events ?? [],
    groupMemberships: userId ? (groupMemberships ?? []) : [],
    todoAssignments: userId ? (todoAssignments ?? []) : [],
    memberGroupIds,
    assignedTodoIds,
    todos: hasTodoAccess ? (todos ?? []) : [],
    timelineEvents: timelineEvents ?? [],
    agendaItems: eventIds.length > 0 ? (agendaItems ?? []) : [],
    elections: elections ?? [],
    eventVotingSessions: [] as readonly { readonly id: string }[],
    allHashtags: allHashtags ?? [],
    isLoading: false,
  }
}
