import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface EventStateOptions {
  eventId?: string
  groupId?: string
  userId?: string
  includeMeetingSlotsByUser?: boolean
}

/**
 * Reactive state hook for event data.
 * Returns all query-derived state — no mutations.
 */
export function useEventState(options: EventStateOptions = {}) {
  const { eventId, groupId, userId, includeMeetingSlotsByUser } = options

  const [event, eventResult] = useQuery(
    eventId ? queries.events.byId({ id: eventId }) : undefined
  )

  const [participants, participantsResult] = useQuery(
    eventId ? queries.events.participants({ eventId }) : undefined
  )

  const [agenda, agendaResult] = useQuery(
    eventId ? queries.events.agenda({ eventId }) : undefined
  )

  const [delegates, delegatesResult] = useQuery(
    eventId ? queries.events.delegates({ eventId }) : undefined
  )

  const [positions, positionsResult] = useQuery(
    eventId ? queries.events.positions({ eventId }) : undefined
  )

  // ── Events by group (opt-in) ───────────────────────────────────────
  const [eventsByGroup, eventsByGroupResult] = useQuery(
    groupId ? queries.events.byGroup({ groupId }) : undefined
  )

  // ── Participants by user (opt-in) ──────────────────────────────────
  const [participantsByUser, participantsByUserResult] = useQuery(
    userId ? queries.events.participantsByUser({ user_id: userId }) : undefined
  )

  // ── Meeting slots by user (opt-in) ────────────────────────────────
  const [meetingSlotsByUser, meetingSlotsByUserResult] = useQuery(
    includeMeetingSlotsByUser && userId
      ? queries.events.meetingSlotsByUser({ user_id: userId })
      : undefined
  )

  const isLoading =
    (eventId !== undefined && eventResult.type === 'unknown') ||
    (eventId !== undefined && participantsResult.type === 'unknown') ||
    (eventId !== undefined && agendaResult.type === 'unknown') ||
    (eventId !== undefined && delegatesResult.type === 'unknown') ||
    (eventId !== undefined && positionsResult.type === 'unknown') ||
    (groupId !== undefined && eventsByGroupResult.type === 'unknown') ||
    (userId !== undefined && participantsByUserResult.type === 'unknown') ||
    (includeMeetingSlotsByUser === true && userId !== undefined && meetingSlotsByUserResult.type === 'unknown')

  return {
    event,
    participants,
    agenda,
    delegates,
    positions,
    eventsByGroup: eventsByGroup ?? [],
    participantsByUser: participantsByUser ?? [],
    meetingSlotsByUser: meetingSlotsByUser ?? [],
    isLoading,
  }
}

// ── Focused Query Hooks ─────────────────────────────────────────────
// (Migrated from hooks.ts — each wraps a single formal query)

// ── Event Data ──────────────────────────────────────────────────────

export function useEventById(eventId?: string) {
  const [eventsData, eventsResult] = useQuery(
    eventId ? queries.events.byIdFull({ id: eventId }) : undefined
  )

  const isLoading = eventsResult.type === 'unknown'
  const event = useMemo(() => eventsData?.[0] || null, [eventsData])
  const participants = useMemo(() => event?.participants || [], [event])
  const delegates = useMemo(() => event?.delegates || [], [event])
  const agendaItems = useMemo(() => event?.agenda_items || [], [event])
  const positions = useMemo(() => event?.event_positions || [], [event])

  const participantStats = useMemo(() => {
    const stats = { total: participants.length, members: 0, admins: 0, invited: 0, requested: 0 }
    participants.forEach((p) => {
      if (p.status === 'member') stats.members++
      if (p.status === 'admin') stats.admins++
      if (p.status === 'invited') stats.invited++
      if (p.status === 'requested') stats.requested++
    })
    return stats
  }, [participants])

  return { event, participants, delegates, agendaItems, positions, participantStats, isLoading }
}

// ── Event with cancellation relations ───────────────────────────────

export function useEventForCancel(eventId: string) {
  const [eventsData, eventsResult] = useQuery(
    queries.events.forCancel({ id: eventId })
  )

  return {
    event: eventsData?.[0] || null,
    isLoading: eventsResult.type === 'unknown',
  }
}

// ── Event with voting sessions ──────────────────────────────────────

export function useEventWithVoting(eventId: string) {
  const [eventsData, eventsResult] = useQuery(
    queries.events.withVoting({ id: eventId })
  )

  return {
    event: eventsData?.[0] || null,
    isLoading: eventsResult.type === 'unknown',
  }
}

// ── Event stream (full event + nested agenda) ───────────────────────

export function useEventStreamData(eventId: string) {
  const [eventsData, eventsResult] = useQuery(
    queries.events.streamEvent({ id: eventId })
  )

  const [electionVotes, electionVotesResult] = useQuery(
    queries.events.allElectionVotes({})
  )

  const [amendmentVoteEntries, amendmentVoteEntriesResult] = useQuery(
    queries.events.allAmendmentVoteEntries({})
  )

  return {
    event: eventsData?.[0] || null,
    electionVotes: electionVotes || [],
    amendmentVoteEntries: amendmentVoteEntries || [],
    isLoading:
      eventsResult.type === 'unknown' ||
      electionVotesResult.type === 'unknown' ||
      amendmentVoteEntriesResult.type === 'unknown',
  }
}

// ── Event Participants ──────────────────────────────────────────────

export function useEventParticipantsQuery(eventId?: string) {
  const [eventParticipants, participantsResult] = useQuery(
    eventId ? queries.events.participantsWithUserAndRole({ eventId }) : undefined
  )

  const isLoading = participantsResult.type === 'unknown'
  const participants = useMemo(() => eventParticipants || [], [eventParticipants])

  const { activeParticipants, invitedParticipants, requestedParticipants } = useMemo(() => {
    const active: typeof participants = []
    const invited: typeof participants = []
    const requested: typeof participants = []
    participants.forEach(p => {
      if (p.status === 'member' || p.status === 'admin') active.push(p)
      else if (p.status === 'invited') invited.push(p)
      else if (p.status === 'requested') requested.push(p)
    })
    return { activeParticipants: active, invitedParticipants: invited, requestedParticipants: requested }
  }, [participants])

  return { participants, activeParticipants, invitedParticipants, requestedParticipants, isLoading }
}

// ── Event Participation (user-specific) ─────────────────────────────

export function useEventParticipationData(eventId: string, userId: string) {
  const [eventData, eventResult] = useQuery(
    queries.events.forParticipation({ id: eventId })
  )

  const [myParticipation, myParticipationResult] = useQuery(
    queries.events.userParticipation({ userId, eventId })
  )

  const [allParticipants, allParticipantsResult] = useQuery(
    queries.events.allParticipantsByEvent({ eventId })
  )

  return {
    event: eventData?.[0] || null,
    myParticipation: myParticipation?.[0] || null,
    allParticipants: allParticipants || [],
    isLoading:
      eventResult.type === 'unknown' ||
      myParticipationResult.type === 'unknown' ||
      allParticipantsResult.type === 'unknown',
  }
}

// ── Event Positions ─────────────────────────────────────────────────

export function useEventPositionsData(eventId: string) {
  const [eventData, eventResult] = useQuery(
    queries.events.forPositions({ id: eventId })
  )

  const [positionsData, positionsResult] = useQuery(
    queries.events.positionsWithHolders({ eventId })
  )

  return {
    event: eventData?.[0] || null,
    positions: positionsData || [],
    isLoading: eventResult.type === 'unknown' || positionsResult.type === 'unknown',
  }
}

// ── Event Agenda ────────────────────────────────────────────────────

export function useEventAgenda(eventId?: string) {
  const [agendaItemsData, agendaResult] = useQuery(
    eventId ? queries.events.agendaWithElections({ eventId }) : undefined
  )

  return {
    agendaItems: useMemo(() => agendaItemsData || [], [agendaItemsData]),
    isLoading: agendaResult.type === 'unknown',
  }
}

// ── Agenda Items (full) ─────────────────────────────────────────────

export function useAgendaItemsByEvent(eventId: string) {
  const [agendaItemsData, agendaItemsResult] = useQuery(
    queries.events.agendaItemsFull({ eventId })
  )

  const [electionVotes, electionVotesResult] = useQuery(
    queries.events.allElectionVotes({})
  )

  const [amendmentVoteEntries, amendmentVoteEntriesResult] = useQuery(
    queries.events.allAmendmentVoteEntries({})
  )

  const agendaItems = (agendaItemsData || [])
    .filter((item) => item.event?.id === eventId)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  return {
    agendaItems,
    electionVotes: electionVotes || [],
    amendmentVoteEntries: amendmentVoteEntries || [],
    isLoading:
      agendaItemsResult.type === 'unknown' ||
      electionVotesResult.type === 'unknown' ||
      amendmentVoteEntriesResult.type === 'unknown',
  }
}

// ── Single Agenda Item Detail ───────────────────────────────────────

export function useAgendaItemDetail(agendaItemId: string) {
  const [agendaItemsData, agendaItemsResult] = useQuery(
    queries.events.agendaItemDetail({ id: agendaItemId })
  )

  const [electionVotes, electionVotesResult] = useQuery(
    queries.events.allElectionVotes({})
  )

  const [amendmentVoteEntries, amendmentVoteEntriesResult] = useQuery(
    queries.events.allAmendmentVoteEntries({})
  )

  const agendaItem = agendaItemsData?.[0]

  return {
    agendaItem,
    event: agendaItem?.event,
    electionVotes: electionVotes || [],
    amendmentVoteEntries: amendmentVoteEntries || [],
    isLoading:
      agendaItemsResult.type === 'unknown' ||
      electionVotesResult.type === 'unknown' ||
      amendmentVoteEntriesResult.type === 'unknown',
  }
}

// ── Event Delegates ─────────────────────────────────────────────────

export function useEventDelegates(eventId: string, groupId?: string) {
  const [eventData, eventResult] = useQuery(
    queries.events.delegatesFull({ id: eventId })
  )

  const [relationships, relationshipsResult] = useQuery(
    queries.events.groupRelationships({ groupId })
  )

  return {
    event: eventData?.[0] || null,
    relationships: relationships || [],
    isLoading: eventResult.type === 'unknown' || relationshipsResult.type === 'unknown',
  }
}

// ── Additional hooks ────────────────────────────────────────────────

export function useEventSubscribers(eventId?: string) {
  const [eventRows, eventResult] = useQuery(
    eventId ? queries.events.byId({ id: eventId }) : undefined
  )

  const [subscribersData, subscribersResult] = useQuery(
    eventId ? queries.events.subscribersByEvent({ eventId }) : undefined
  )

  return {
    event: eventRows || null,
    subscriberCount: eventRows?.subscriber_count ?? subscribersData?.length ?? 0,
    subscribers: subscribersData || [],
    isLoading: eventResult.type === 'unknown' || subscribersResult.type === 'unknown',
  }
}

export function useEventWikiData(eventId: string) {
  const [events] = useQuery(
    queries.events.wikiData({ id: eventId })
  )

  const [agendaItemRows] = useQuery(
    queries.events.wikiAgendaItems({ eventId })
  )

  return {
    event: events?.[0] || null,
    agendaItems: agendaItemRows || [],
  }
}

export function useEventRoles(eventId: string) {
  const [eventRoles] = useQuery(
    queries.events.rolesByEvent({ eventId })
  )

  return { roles: eventRoles || [] }
}

export function useEventsByGroup(groupId?: string, excludeEventId?: string) {
  const [eventsData] = useQuery(
    groupId ? queries.events.byGroupActive({ groupId }) : undefined
  )

  const events = (eventsData || []).filter(
    e => e.id !== excludeEventId && (e.start_date ?? 0) > Date.now()
  )

  return { events }
}

export function useAllEvents() {
  const [events] = useQuery(queries.events.all({}))
  return { events: events || [] }
}

export function useAllAmendments() {
  const [amendments] = useQuery(queries.events.allAmendments({}))
  return { amendments: amendments || [] }
}

export function usePositionsWithGroups() {
  const [positions] = useQuery(queries.events.positionsWithGroups({}))
  return { positions: positions || [] }
}

export function useUserEventParticipations(userId?: string) {
  const [participations, result] = useQuery(
    userId ? queries.events.userParticipationsWithEvent({ userId }) : undefined
  )

  return {
    participations: participations || [],
    isLoading: !participations && !!userId,
  }
}

export function useEventWithGroup(eventId: string) {
  const [eventRows] = useQuery(
    queries.events.withGroup({ id: eventId })
  )
  return { event: eventRows?.[0] || null }
}

export function useGroupRelationships(groupId?: string) {
  const [relationships] = useQuery(
    queries.events.groupRelationships({ groupId })
  )

  return { relationships: relationships || [] }
}

export function useElectionWithVotes(electionId: string) {
  const [electionsData, electionsResult] = useQuery(
    queries.events.electionWithVotes({ id: electionId })
  )

  return {
    election: electionsData?.[0] || null,
    isLoading: electionsResult.type === 'unknown',
  }
}

export function useVotingSessionWithVotes(sessionId: string) {
  const [sessions, result] = useQuery(
    queries.events.votingSessionWithVotes({ id: sessionId })
  )

  return {
    session: sessions?.[0] || null,
    isLoading: result.type === 'unknown',
  }
}

export function useChangeRequestsByAmendment(amendmentId?: string) {
  const [changeRequests, result] = useQuery(
    amendmentId ? queries.events.changeRequestsByAmendment({ amendmentId }) : undefined
  )

  return {
    changeRequests: changeRequests || [],
    isLoading: result.type === 'unknown',
  }
}

export function useEventsForCalendar() {
  const [events] = useQuery(
    queries.events.forCalendar({})
  )

  return { events: events || [] }
}

export function useEventsForCalendarWithExceptions() {
  const [events] = useQuery(
    queries.events.forCalendarWithExceptions({})
  )

  return { events: events || [] }
}

export function useGroupEventsForCalendar(groupId?: string) {
  const [events] = useQuery(
    groupId ? queries.events.byGroupForCalendar({ groupId }) : undefined
  )

  return { events: events || [] }
}

export function useEventExceptions(eventId?: string) {
  const [exceptions] = useQuery(
    eventId ? queries.events.exceptionsByEvent({ eventId }) : undefined
  )

  return { exceptions: exceptions ?? [] }
}

export function useMeetingSlotsWithBookings() {
  const [meetingSlots] = useQuery(
    queries.events.allMeetingSlots({})
  )

  return { meetingSlots: meetingSlots || [] }
}

export function useMeetingSlotById(meetingId: string) {
  const [meetingSlots] = useQuery(
    queries.events.meetingSlotById({ id: meetingId })
  )

  return { meetingSlot: meetingSlots?.[0] || null }
}

export function useEventWithAgendaAndParticipants(eventId: string) {
  const [eventsData, eventsResult] = useQuery(
    queries.events.withAgendaAndParticipants({ id: eventId })
  )

  return {
    event: eventsData?.[0] || null,
    isLoading: eventsResult.type === 'unknown',
  }
}

// ── User Event Subscriptions (for timeline) ─────────────────────────

export function useUserEventSubscriptions(userId?: string) {
  const [participations, result] = useQuery(
    userId ? queries.events.userSubscriptions({ userId }) : undefined
  )

  return {
    participations: participations ?? [],
    isLoading: result.type === 'unknown',
  }
}
