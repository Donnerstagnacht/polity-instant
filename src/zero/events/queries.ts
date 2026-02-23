import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const eventQueries = {
  // ── Existing queries ──────────────────────────────────────────────

  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) => zql.event.where('id', id).one()
  ),

  byGroup: defineQuery(
    z.object({ groupId: z.string() }),
    ({ args: { groupId } }) =>
      zql.event
        .where('group_id', groupId)
        .orderBy('start_date', 'desc')
  ),

  upcoming: defineQuery(
    z.object({ groupId: z.string().optional() }),
    ({ args: { groupId } }) => {
      let q = zql.event
        .where('status', '!=', 'cancelled')
        .orderBy('start_date', 'asc')
      if (groupId) {
        q = q.where('group_id', groupId)
      }
      return q
    }
  ),

  participants: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_participant
        .where('event_id', eventId)
        .orderBy('created_at', 'asc')
  ),

  agenda: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_voting_session
        .where('event_id', eventId)
        .orderBy('created_at', 'asc')
  ),

  voting: defineQuery(
    z.object({ sessionId: z.string() }),
    ({ args: { sessionId } }) =>
      zql.event_vote
        .where('session_id', sessionId)
        .orderBy('created_at', 'asc')
  ),

  delegates: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_delegate
        .where('event_id', eventId)
        .orderBy('created_at', 'asc')
  ),

  positions: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_position
        .where('event_id', eventId)
        .orderBy('title', 'asc')
  ),

  participantsByUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.event_participant
        .where('user_id', user_id)
        .related('event', q => q.related('creator'))
        .related('role')
  ),

  meetingSlotsByUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.meeting_slot
        .where('user_id', user_id)
        .related('user')
        .related('bookings', q => q.related('user'))
  ),

  // ── New queries (extracted from hooks.ts) ─────────────────────────

  /** Deep event by ID with creator, group→memberships→user, participants→user+role→action_rights, delegates→user, agenda_items→election, event_positions */
  byIdFull: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('creator')
        .related('group', q =>
          q.related('memberships', q => q.related('user'))
        )
        .related('participants', q =>
          q.related('user').related('role', q => q.related('action_rights'))
        )
        .related('delegates', q => q.related('user'))
        .related('agenda_items', q => q.related('election'))
        .related('event_positions')
  ),

  /** Event with cancellation-related data (agenda_items→amendment+election→position, participants→user) */
  forCancel: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('agenda_items', q =>
          q.related('amendment')
            .related('election', q => q.related('position'))
        )
        .related('participants', q => q.related('user'))
  ),

  /** Event with voting sessions (participants→user+role→action_rights, voting_sessions→votes→user+agenda_item→amendment→group+event) */
  withVoting: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('participants', q =>
          q.related('user').related('role', q => q.related('action_rights'))
        )
        .related('voting_sessions', q =>
          q.related('votes', q => q.related('user'))
            .related('agenda_item', q =>
              q.related('amendment', q => q.related('group').related('event'))
            )
        )
  ),

  /** Event stream data: event with creator, agenda_items with deep relations */
  streamEvent: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('creator')
        .related('agenda_items', q =>
          q.related('creator')
            .related('speaker_list', q => q.related('user'))
            .related('election', q =>
              q.related('candidates').related('votes')
            )
            .related('amendment', q =>
              q.related('change_requests').related('vote_entries')
            )
        )
  ),

  /** All election votes with voter, candidate, election relations */
  allElectionVotes: defineQuery(
    z.object({}),
    () =>
      zql.election_vote
        .related('voter')
        .related('candidate')
        .related('election')
  ),

  /** All amendment vote entries with user, amendment relations */
  allAmendmentVoteEntries: defineQuery(
    z.object({}),
    () =>
      zql.amendment_vote_entry
        .related('user')
        .related('amendment')
  ),

  /** Event participants with user and role (for participant list) */
  participantsWithUserAndRole: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_participant
        .where('event_id', eventId)
        .related('user')
        .related('role')
  ),

  /** Event with group→memberships→user and delegates→user (for participation) */
  forParticipation: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('group', q =>
          q.related('memberships', q => q.related('user'))
        )
        .related('delegates', q => q.related('user'))
  ),

  /** User's participation in a specific event */
  userParticipation: defineQuery(
    z.object({ userId: z.string(), eventId: z.string() }),
    ({ args: { userId, eventId } }) =>
      zql.event_participant
        .where('user_id', userId)
        .where('event_id', eventId)
  ),

  /** All participants for an event (no relations) */
  allParticipantsByEvent: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_participant
        .where('event_id', eventId)
  ),

  /** Event with creator and group (for positions page) */
  forPositions: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('creator')
        .related('group')
  ),

  /** Event positions with holder→user relations */
  positionsWithHolders: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_position
        .where('event_id', eventId)
        .related('holders', q => q.related('user'))
  ),

  /** Agenda items for an event with election→candidates and amendment */
  agendaWithElections: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.agenda_item
        .where('event_id', eventId)
        .related('election', q => q.related('candidates'))
        .related('amendment')
  ),

  /** Full agenda items with all nested relations (for agenda view) */
  agendaItemsFull: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.agenda_item
        .where('event_id', eventId)
        .related('creator')
        .related('event')
        .related('election', q =>
          q.related('candidates')
            .related('votes')
            .related('position', q => q.related('group'))
        )
        .related('amendment', q =>
          q.related('change_requests')
            .related('vote_entries')
        )
        .related('speaker_list', q => q.related('user'))
  ),

  /** Single agenda item detail with all nested relations */
  agendaItemDetail: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.agenda_item
        .where('id', id)
        .related('creator')
        .related('event', q => q.related('creator'))
        .related('election', q =>
          q.related('candidates', c => c.related('user'))
            .related('votes', v => v.related('voter').related('candidate'))
        )
        .related('amendment', q =>
          q.related('change_requests')
            .related('vote_entries', v => v.related('user'))
        )
        .related('speaker_list', q => q.related('user'))
  ),

  /** Event with delegates→user and delegate_allocations */
  delegatesFull: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('delegates', q => q.related('user'))
        .related('delegate_allocations')
  ),

  /** Group relationships by group with related_group and group */
  groupRelationships: defineQuery(
    z.object({ groupId: z.string().optional() }),
    ({ args: { groupId } }) => {
      let q = zql.group_relationship
        .related('related_group')
        .related('group')
      if (groupId) {
        q = q.where('group_id', groupId) as typeof q
      }
      return q
    }
  ),

  /** Subscribers for an event with subscriber_user and event */
  subscribersByEvent: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.subscriber
        .where('event_id', eventId)
        .related('subscriber_user')
        .related('event')
  ),

  /** Event wiki data with creator, group, hashtags, positions→holders→user, participants→user */
  wikiData: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('creator')
        .related('group')
        .related('event_hashtags', q => q.related('hashtag'))
        .related('event_positions', q => q.related('holders', q => q.related('user')))
        .related('participants', q => q.related('user'))
  ),

  /** Agenda items for wiki with event, election→candidates→user+position */
  wikiAgendaItems: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.agenda_item
        .where('event_id', eventId)
        .related('event')
        .related('election', q => q.related('candidates', q => q.related('user')).related('position'))
  ),

  /** Event roles scoped to event with action_rights */
  rolesByEvent: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.role
        .where('event_id', eventId)
        .where('scope', 'event')
        .related('action_rights')
  ),

  /** Events by group, non-cancelled (for selectors) */
  byGroupActive: defineQuery(
    z.object({ groupId: z.string() }),
    ({ args: { groupId } }) =>
      zql.event
        .where('group_id', groupId)
        .where('status', '!=', 'cancelled')
  ),

  /** All events (no filter) */
  all: defineQuery(
    z.object({}),
    () => zql.event
  ),

  /** All amendments (no filter) */
  allAmendments: defineQuery(
    z.object({}),
    () => zql.amendment
  ),

  /** All positions with group relation */
  positionsWithGroups: defineQuery(
    z.object({}),
    () => zql.position.related('group')
  ),

  /** User event participations with event→group */
  userParticipationsWithEvent: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.event_participant
        .where('user_id', userId)
        .related('event', q => q.related('group'))
  ),

  /** Event with group relation (simple) */
  withGroup: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('group')
  ),

  /** Election by ID with full relations (position→group, candidates→user, votes→voter+candidate) */
  electionWithVotes: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.election
        .where('id', id)
        .related('position', q => q.related('group'))
        .related('candidates', q => q.related('user'))
        .related('votes', q => q.related('voter').related('candidate'))
  ),

  /** Voting session by ID with votes→user */
  votingSessionWithVotes: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event_voting_session
        .where('id', id)
        .related('votes', q => q.related('user'))
  ),

  /** Change requests by amendment with user */
  changeRequestsByAmendment: defineQuery(
    z.object({ amendmentId: z.string() }),
    ({ args: { amendmentId } }) =>
      zql.change_request
        .where('amendment_id', amendmentId)
        .related('user')
  ),

  /** All events with creator, group, participants→user (for calendar) */
  forCalendar: defineQuery(
    z.object({}),
    () =>
      zql.event
        .related('creator')
        .related('group')
        .related('participants', q => q.related('user'))
  ),

  /** All meeting slots with user, bookings→user */
  allMeetingSlots: defineQuery(
    z.object({}),
    () =>
      zql.meeting_slot
        .related('user')
        .related('bookings', q => q.related('user'))
  ),

  /** Single meeting slot by ID with user, bookings→user */
  meetingSlotById: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.meeting_slot
        .where('id', id)
        .related('user')
        .related('bookings', q => q.related('user'))
  ),

  /** Event with agenda_items and participants→user (for agenda+participant views) */
  withAgendaAndParticipants: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('agenda_items')
        .related('participants', q => q.related('user'))
  ),

  /** User event subscriptions (participations with deep event relations for timeline) */
  userSubscriptions: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.event_participant
        .where('user_id', userId)
        .related('event', q =>
          q.related('event_hashtags', q => q.related('hashtag'))
            .related('participants')
            .related('voting_sessions')
            .related('event_positions')
            .related('scheduled_elections')
            .related('agenda_items', q => q.related('election').related('amendment'))
        )
  ),
}
