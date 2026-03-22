import { defineQuery, type QueryRowType } from '@rocicorp/zero'
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

  /** Event agenda items by event (replaces old event_voting_session query) */
  agenda: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.agenda_item
        .where('event_id', eventId)
        .orderBy('order_index', 'asc')
  ),

  /** Votes by agenda item */
  voting: defineQuery(
    z.object({ agendaItemId: z.string() }),
    ({ args: { agendaItemId } }) =>
      zql.vote
        .where('agenda_item_id', agendaItemId)
        .related('choices')
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

  /** Event with voting data (participants→user+role→action_rights, agenda_items→votes→choices+decisions) */
  withVoting: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.event
        .where('id', id)
        .related('participants', q =>
          q.related('user').related('role', q => q.related('action_rights'))
        )
        .related('agenda_items', q =>
          q.related('votes', vq =>
            vq.related('choices')
              .related('indicative_decisions', d => d.related('choice'))
              .related('final_decisions', d => d.related('choice'))
              .related('voters')
          )
          .related('amendment', aq => aq.related('group').related('event'))
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
              q.related('candidates', c => c.related('user'))
                .related('indicative_selections', s => s.related('candidate'))
                .related('final_selections', s => s.related('candidate'))
                .related('electors')
            )
            .related('votes', q =>
              q.related('choices')
                .related('indicative_decisions', d => d.related('choice'))
                .related('final_decisions', d => d.related('choice'))
                .related('voters')
            )
            .related('amendment', q =>
              q.related('change_requests')
            )
        )
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
          q.related('candidates', c => c.related('user'))
            .related('indicative_selections', s => s.related('candidate'))
            .related('final_selections', s => s.related('candidate'))
            .related('electors', e => e.related('user'))
            .related(
              'indicative_participations',
              p => p.related('elector').related('selections', s => s.related('candidate'))
            )
            .related(
              'final_participations',
              p => p.related('elector').related('selections', s => s.related('candidate'))
            )
            .related('position', q => q.related('group'))
        )
        .related('votes', q =>
          q.related('choices')
            .related('indicative_decisions', d => d.related('choice'))
            .related('final_decisions', d => d.related('choice'))
            .related('voters', v => v.related('user'))
            .related(
              'indicative_participations',
              p => p.related('voter').related('decisions', d => d.related('choice'))
            )
            .related(
              'final_participations',
              p => p.related('voter').related('decisions', d => d.related('choice'))
            )
        )
        .related('amendment', q =>
          q.related('change_requests').related('group')
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
            .related('indicative_selections', s => s.related('candidate'))
            .related('final_selections', s => s.related('candidate'))
            .related('electors', e => e.related('user'))
        )
        .related('votes', q =>
          q.related('choices')
            .related('indicative_decisions', d => d.related('choice'))
            .related('final_decisions', d => d.related('choice'))
            .related('voters', v => v.related('user'))
        )
        .related('amendment', q =>
          q.related('change_requests').related('group')
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

  /** Election by ID with full relations (position→group, candidates→user, indicative/final selections) */
  electionWithVotes: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.election
        .where('id', id)
        .related('position', q => q.related('group'))
        .related('candidates', q => q.related('user'))
        .related('electors')
        .related('indicative_selections', q => q.related('candidate'))
        .related('final_selections', q => q.related('candidate'))
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
            .related('event_positions')
            .related('agenda_items', q => q.related('election').related('amendment'))
        )
  ),

  // ── Event exception queries ───────────────────────────────────────

  /** Exceptions for a recurring event */
  exceptionsByEvent: defineQuery(
    z.object({ eventId: z.string() }),
    ({ args: { eventId } }) =>
      zql.event_exception
        .where('parent_event_id', eventId)
        .orderBy('original_date', 'asc')
  ),

  /** All events with creator, group, participants→user, exceptions, hashtags (for calendar with recurrence) */
  forCalendarWithExceptions: defineQuery(
    z.object({}),
    () =>
      zql.event
        .related('creator')
        .related('group')
        .related('participants', q => q.related('user'))
        .related('exceptions')
        .related('event_hashtags', q => q.related('hashtag'))
  ),

  /** Group events with creator, participants→user, exceptions, hashtags (for group calendar view) */
  byGroupForCalendar: defineQuery(
    z.object({ groupId: z.string() }),
    ({ args: { groupId } }) =>
      zql.event
        .where('group_id', groupId)
        .related('creator')
        .related('group')
        .related('participants', q => q.related('user'))
        .related('exceptions')
        .related('event_hashtags', q => q.related('hashtag'))
  ),

  /** Events created by a user with participants→user, exceptions, hashtags (for meet page) */
  byCreator: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.event
        .where('creator_id', userId)
        .related('creator')
        .related('group')
        .related('participants', q => q.related('user'))
        .related('exceptions')
        .related('event_hashtags', q => q.related('hashtag'))
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type EventByIdFullRow = QueryRowType<typeof eventQueries.byIdFull>;
export type EventWithVotingRow = QueryRowType<typeof eventQueries.withVoting>;
export type EventStreamRow = QueryRowType<typeof eventQueries.streamEvent>;
export type EventWikiRow = QueryRowType<typeof eventQueries.wikiData>;
export type EventForCalendarRow = QueryRowType<typeof eventQueries.forCalendarWithExceptions>;
export type EventByCreatorRow = QueryRowType<typeof eventQueries.byCreator>;
export type EventSubscriptionRow = QueryRowType<typeof eventQueries.userSubscriptions>;
export type EventParticipantWithUserRow = QueryRowType<typeof eventQueries.participantsWithUserAndRole>;
export type EventAgendaItemFullRow = QueryRowType<typeof eventQueries.agendaItemsFull>;
export type EventAgendaItemDetailRow = QueryRowType<typeof eventQueries.agendaItemDetail>;
export type EventWikiAgendaRow = QueryRowType<typeof eventQueries.wikiAgendaItems>;
export type EventPositionWithHoldersRow = QueryRowType<typeof eventQueries.positionsWithHolders>;
export type EventElectionWithVotesRow = QueryRowType<typeof eventQueries.electionWithVotes>;
export type EventMeetingSlotRow = QueryRowType<typeof eventQueries.meetingSlotById>;
export type EventDelegatesFullRow = QueryRowType<typeof eventQueries.delegatesFull>;
export type EventParticipantsByUserRow = QueryRowType<typeof eventQueries.participantsByUser>;
