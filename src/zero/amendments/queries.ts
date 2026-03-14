import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const amendmentQueries = {
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment.where('id', id).one()
  ),

  // Full amendment with all related entities for detail views
  byIdWithRelations: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment
        .where('id', id)
        .related('created_by')
        .related('group')
        .related('collaborators', q => q.related('user'))
        .related('change_requests', q => q.related('user').related('votes'))
        .related('threads', q => q.related('user').related('comments'))
        .one()
  ),

  // Full amendment for wiki view (all relations)
  byIdFull: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment
        .where('id', id)
        .related('collaborators', q => q.related('user'))
        .related('amendment_hashtags', q => q.related('hashtag'))
        .related('vote_entries', q => q.related('user'))
        .related('change_requests')
        .related('support_confirmations')
        .related('group')
        .related('paths', q => q.related('segments'))
        .related('documents')
        .related('clone_source')
        .one()
  ),

  // Amendment with process/path data
  byIdWithProcessData: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment
        .where('id', id)
        .related('group')
        .related('event')
        .related('agenda_items')
        .related('votes')
        .related('paths', q => q.related('segments', sq => sq.related('group').related('event')))
        .one()
  ),

  // Amendment with document + collaborators for editor
  byIdWithDocsAndCollabs: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment
        .where('id', id)
        .related('documents', q => q.related('collaborators', cq => cq.related('user')))
        .related('collaborators', q => q.related('user'))
        .one()
  ),

  // Amendment with group, event, paths+segments for path visualization
  byIdWithPathViz: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.amendment
        .where('id', id)
        .related('group')
        .related('event')
        .related('paths', q => q.related('segments'))
        .one()
  ),

  byGroup: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.amendment
        .where('group_id', group_id)
        .orderBy('created_at', 'desc')
  ),

  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.amendment
        .where('created_by_id', userID)
        .orderBy('created_at', 'desc')
  ),

  collaborators: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.amendment_collaborator
        .where('amendment_id', amendment_id)
        .related('user')
        .orderBy('created_at', 'desc')
  ),

  // Current user's collaboration on a specific amendment
  userCollaboration: defineQuery(
    z.object({ amendment_id: z.string(), user_id: z.string() }),
    ({ args: { amendment_id, user_id } }) =>
      zql.amendment_collaborator
        .where('amendment_id', amendment_id)
        .where('user_id', user_id)
  ),

  changeRequests: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.change_request
        .where('amendment_id', amendment_id)
        .orderBy('created_at', 'desc')
  ),

  // Change requests with votes and user for voting UI
  changeRequestsWithVotes: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.change_request
        .where('amendment_id', amendment_id)
        .related('votes', q => q.related('user'))
        .orderBy('created_at', 'desc')
  ),

  votingSessions: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.amendment_voting_session
        .where('amendment_id', amendment_id)
        .orderBy('created_at', 'desc')
  ),

  paths: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.amendment_path
        .where('amendment_id', amendment_id)
        .orderBy('created_at', 'desc')
  ),

  // Support confirmations for a group
  supportConfirmations: defineQuery(
    z.object({ group_id: z.string(), status: z.string() }),
    ({ args: { group_id, status } }) =>
      zql.support_confirmation
        .where('group_id', group_id)
        .where('status', status)
        .related('amendment', q => q.related('documents'))
  ),

  // Support confirmations by user (pending)
  supportConfirmationsByUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.support_confirmation
        .where('confirmed_by_id', user_id)
        .where('status', 'pending')
        .related('amendment')
  ),

  // Subscribers for an amendment
  subscribers: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.subscriber
        .where('amendment_id', amendment_id)
        .related('subscriber_user')
        .related('amendment')
  ),

  // Clones of an amendment
  clonesBySource: defineQuery(
    z.object({ source_id: z.string() }),
    ({ args: { source_id } }) =>
      zql.amendment.where('clone_source_id', source_id)
  ),

  // Threads with deep relations for discussion views
  threads: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.thread
        .where('amendment_id', amendment_id)
        .related('user')
        .related('votes', q => q.related('user'))
        .related('comments', q =>
          q.related('user')
            .related('votes', vq => vq.related('user'))
            .related('parent')
        )
  ),

  // Documents by amendment
  documentsByAmendment: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.document.where('amendment_id', amendment_id)
  ),

  // Roles for amendment collaborators
  rolesByAmendment: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.role
        .where('amendment_id', amendment_id)
        .where('scope', 'amendment')
        .related('action_rights')
  ),

  // All amendment votes with relations (for decision terminal)
  amendmentVotesAll: defineQuery(
    z.object({}),
    () =>
      zql.amendment_vote
        .related('amendment')
        .related('user')
  ),

  // Document versions by document
  documentVersionsByDocument: defineQuery(
    z.object({ document_id: z.string() }),
    ({ args: { document_id } }) =>
      zql.document_version
        .where('document_id', document_id)
        .related('author')
  ),

  // Cross-domain: All groups
  allGroups: defineQuery(
    z.object({}),
    () => zql.group
  ),

  // Cross-domain: All group relationships with related groups
  allGroupRelationships: defineQuery(
    z.object({}),
    () => zql.group_relationship.related('group').related('related_group')
  ),

  // Cross-domain: All group memberships with user and group
  allGroupMemberships: defineQuery(
    z.object({}),
    () => zql.group_membership.related('group').related('user')
  ),

  // Cross-domain: User group memberships
  userGroupMemberships: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.group_membership
        .where('user_id', user_id)
        .related('user')
        .related('group')
  ),

  // Cross-domain: All events with group
  allEvents: defineQuery(
    z.object({}),
    () => zql.event.related('group')
  ),

  // Cross-domain: Events by group with group
  eventsByGroup: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.event.where('group_id', group_id).related('group')
  ),

  // Cross-domain: All users
  allUsers: defineQuery(
    z.object({}),
    () => zql.user
  ),

  // Cross-domain: Users by IDs
  usersByIds: defineQuery(
    z.object({ ids: z.array(z.string()) }),
    ({ args: { ids } }) =>
      ids.length > 0
        ? zql.user.where('id', 'IN', ids)
        : zql.user.where('id', '__none__')
  ),

  // Cross-domain: User by ID
  userById: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) => zql.user.where('id', id).limit(1)
  ),

  collaboratorsByUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.amendment_collaborator
        .where('user_id', user_id)
        .related('amendment', q => q.related('created_by'))
  ),
}
