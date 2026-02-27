import { defineQuery } from '@rocicorp/zero';
import { z } from 'zod';
import { zql } from '../schema';

export const groupQueries = {
  // ── Existing queries (unchanged) ──────────────────────────────────

  byId: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group.where('id', id).one()
  ),

  byUser: defineQuery(z.object({}), ({ ctx: { userID } }) =>
    zql.group_membership.where('user_id', userID).orderBy('created_at', 'desc')
  ),

  search: defineQuery(z.object({ query: z.string() }), ({ args: { query } }) =>
    zql.group.where('name', 'ILIKE', `%${query}%`).orderBy('name', 'asc')
  ),

  memberships: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.group_membership.where('group_id', groupId).orderBy('created_at', 'desc')
  ),

  hierarchy: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.group_relationship.where('group_id', groupId).orderBy('created_at', 'desc')
  ),

  allRelationships: defineQuery(z.object({}), () =>
    zql.group_relationship.orderBy('created_at', 'desc')
  ),

  allRelationshipsWithGroups: defineQuery(z.object({}), () =>
    zql.group_relationship.related('group').related('related_group').orderBy('created_at', 'desc')
  ),

  roles: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.role.where('group_id', groupId).orderBy('name', 'asc')
  ),

  positions: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.position.where('group_id', groupId).orderBy('title', 'asc')
  ),

  membershipsByUser: defineQuery(z.object({ user_id: z.string() }), ({ args: { user_id } }) =>
    zql.group_membership
      .where('user_id', user_id)
      .related('group', q => q.related('owner'))
      .related('role')
  ),

  currentUserMembershipsWithGroups: defineQuery(z.object({}), ({ ctx: { userID } }) =>
    zql.group_membership.where('user_id', userID).related('group').related('role')
  ),

  membershipsWithUsers: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.group_membership.where('group_id', groupId).related('user')
  ),

  // ── New queries (extracted from hooks.ts) ─────────────────────────

  /** Deep-relational query powering the GroupWiki page */
  wikiData: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group
      .where('id', id)
      .related('owner')
      .related('events')
      .related('amendments')
      .related('memberships', q => q.related('user'))
      .related('relationships_as_source', q =>
        q.related('related_group', q =>
          q.related('memberships').related('events').related('amendments')
        )
      )
      .related('group_hashtags', q => q.related('hashtag'))
      .related('positions', q => q.related('holder_history', q => q.related('user')))
      .related('blogs', q => q.related('blog_hashtags', q => q.related('hashtag')))
  ),

  /** User's membership rows in a specific group, with role */
  userMembershipInGroup: defineQuery(
    z.object({ userId: z.string(), groupId: z.string() }),
    ({ args: { userId, groupId } }) =>
      zql.group_membership.where('user_id', userId).where('group_id', groupId).related('role')
  ),

  /** All membership rows for a group, with role (used alongside userMembershipInGroup) */
  allMembershipsInGroupWithRole: defineQuery(
    z.object({ groupId: z.string() }),
    ({ args: { groupId } }) => zql.group_membership.where('group_id', groupId).related('role')
  ),

  /** Subscribers for a group with user and group relations */
  subscribersByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.subscriber.where('group_id', groupId).related('subscriber_user').related('group')
  ),

  /** All groups (no relations, no filter) */
  all: defineQuery(z.object({}), () => zql.group),

  /** All documents with collaborator→user relations (cross-domain convenience) */
  allDocuments: defineQuery(z.object({}), () =>
    zql.document.related('collaborators', q => q.related('user'))
  ),

  /** Group by ID with owner, conversations, memberships→user+role, roles→action_rights, events, amendments */
  byIdFull: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group
      .where('id', id)
      .related('owner')
      .related('conversations', q => q.related('participants', q => q.related('user')))
      .related('memberships', q => q.related('user').related('role'))
      .related('roles', q => q.related('action_rights'))
      .related('events')
      .related('amendments')
  ),

  /** Memberships for a group with user and role→action_rights (for membership tables) */
  membershipsWithRolesAndRights: defineQuery(
    z.object({ groupId: z.string() }),
    ({ args: { groupId } }) =>
      zql.group_membership
        .where('group_id', groupId)
        .related('user')
        .related('role', q => q.related('action_rights'))
  ),

  /** Roles scoped to a group with action_rights */
  rolesWithRights: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.role.where('group_id', groupId).where('scope', 'group').related('action_rights')
  ),

  /** All group_relationship rows with both group and related_group (for network views) */
  networkRelationships: defineQuery(z.object({}), () =>
    zql.group_relationship.related('group').related('related_group')
  ),

  /** Amendments for a group with hashtags and creator */
  amendmentsByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.amendment.where('group_id', groupId).related('amendment_hashtags', q => q.related('hashtag')).related('created_by')
  ),

  /** Amendments for a group with nested documents→collaborators→user (for group document lists) */
  amendmentsWithDocuments: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.amendment
      .where('group_id', groupId)
      .related('documents', q => q.related('collaborators', cq => cq.related('user')))
  ),

  /** Positions for a group with group, elections→agenda_item+candidates, and holder_history */
  positionsFull: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.position
      .where('group_id', groupId)
      .related('group')
      .related('elections', (q: any) =>
        q
          .related('agenda_item', (a: any) => a.related('event'))
          .related('candidates', (c: any) => c.related('user'))
      )
      .related('holder_history', (q: any) => q.related('user'))
  ),

  /** Todos for a group with creator, assignments→user, and group */
  todosByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.todo
      .where('group_id', groupId)
      .related('creator')
      .related('assignments', (q: any) => q.related('user'))
      .related('group')
  ),

  /** Links belonging to a group */
  linksByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.link.where('group_id', groupId)
  ),

  /** Payments where the group is the receiver */
  paymentsReceivedByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.payment
      .where('receiver_group_id', groupId)
      .related('receiver_group')
      .related('payer_group')
      .related('receiver_user')
      .related('payer_user')
  ),

  /** Payments where the group is the payer */
  paymentsPaidByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.payment
      .where('payer_group_id', groupId)
      .related('receiver_group')
      .related('payer_group')
      .related('receiver_user')
      .related('payer_user')
  ),

  /** Active (status='member') memberships for a group with user data (for dialogs) */
  activeMembersByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.group_membership.where('group_id', groupId).where('status', 'member').related('user')
  ),

  /** All users limited to 20 (for user search / invite dialogs) */
  allUsersLimited: defineQuery(z.object({}), () => zql.user.limit(20)),

  /** Public groups with optional limit */
  publicGroups: defineQuery(z.object({}), () => zql.group.where('is_public', true).limit(100)),

  /** User's group memberships with nested group→hashtags, events, amendments (for timeline) */
  userMembershipsWithGroupRelations: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.group_membership
        .where('user_id', userId)
        .related('group', q => q.related('group_hashtags', q => q.related('hashtag')).related('events').related('amendments'))
  ),

  /** Single group by ID (no relations, for subscriber name lookups) */
  byIdBasic: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group.where('id', id)
  ),

  /** Single group by ID for network view (no relations) */
  byIdForNetwork: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group.where('id', id)
  ),
};
