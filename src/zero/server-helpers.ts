/**
 * Shared helpers for server-side mutator overrides.
 * Provides DB lookup functions used across domain server-mutators.
 */
import { zql } from './schema'

const ACTIVE_GROUP_STATUSES = new Set(['active', 'member', 'admin'])
const ACTIVE_EVENT_STATUSES = new Set(['confirmed', 'member', 'admin'])
const ACTIVE_COLLABORATOR_STATUSES = new Set(['collaborator', 'member', 'admin'])

function isOpenChangeRequest(status: string | null | undefined) {
  return !status || status === 'open'
}

/** Read group name by id. */
export async function groupName(tx: any, groupId: string): Promise<string> {
  const g = await tx.run(zql.group.where('id', groupId).one())
  return g?.name ?? 'Group'
}

/** Read event title by id. */
export async function eventTitle(tx: any, eventId: string): Promise<string> {
  const e = await tx.run(zql.event.where('id', eventId).one())
  return e?.title ?? 'Event'
}

/** Read amendment title by id. */
export async function amendmentTitle(tx: any, amendmentId: string): Promise<string> {
  const a = await tx.run(zql.amendment.where('id', amendmentId).one())
  return a?.title ?? 'Amendment'
}

/** Read blog title by id. */
export async function blogTitle(tx: any, blogId: string): Promise<string> {
  const b = await tx.run(zql.blog.where('id', blogId).one())
  return b?.title ?? 'Blog'
}

/** Read user display name. */
export async function userName(tx: any, userId: string): Promise<string> {
  const u = await tx.run(zql.user.where('id', userId).one())
  return u?.name || u?.email?.split('@')[0] || 'A user'
}

/** Read role by id. */
export async function roleName(tx: any, roleId: string): Promise<{ name: string; groupId: string | null }> {
  const r = await tx.run(zql.role.where('id', roleId).one())
  return { name: r?.name ?? 'Role', groupId: r?.group_id ?? null }
}

export async function recomputeUserCounters(tx: any, userId: string): Promise<void> {
  const [subscribers, memberships, amendments] = await Promise.all([
    tx.run(zql.subscriber.where('user_id', userId)),
    tx.run(zql.group_membership.where('user_id', userId)),
    tx.run(zql.amendment.where('created_by_id', userId)),
  ])

  const groups = memberships.filter(
    (membership: any) => membership.source !== 'derived' && ACTIVE_GROUP_STATUSES.has(membership.status ?? '')
  ).length

  await tx.mutate.user.update({
    id: userId,
    subscriber_count: subscribers.length,
    group_count: groups,
    amendment_count: amendments.length,
  })
}

export async function recomputeGroupCounters(tx: any, groupId: string): Promise<void> {
  const [memberships, subscribers, events, amendments] = await Promise.all([
    tx.run(zql.group_membership.where('group_id', groupId)),
    tx.run(zql.subscriber.where('group_id', groupId)),
    tx.run(zql.event.where('group_id', groupId)),
    tx.run(zql.amendment.where('group_id', groupId)),
  ])

  const members = memberships.filter((membership: any) => ACTIVE_GROUP_STATUSES.has(membership.status ?? '')).length
  const activeEvents = events.filter((event: any) => event.status !== 'cancelled').length

  await tx.mutate.group.update({
    id: groupId,
    member_count: members,
    subscriber_count: subscribers.length,
    event_count: activeEvents,
    amendment_count: amendments.length,
  })
}

export async function recomputeEventCounters(tx: any, eventId: string): Promise<void> {
  const [participants, subscribers, agendaItems, amendments] = await Promise.all([
    tx.run(zql.event_participant.where('event_id', eventId)),
    tx.run(zql.subscriber.where('event_id', eventId)),
    tx.run(zql.agenda_item.where('event_id', eventId)),
    tx.run(zql.amendment.where('event_id', eventId)),
  ])

  const participantCount = participants.filter((participant: any) => ACTIVE_EVENT_STATUSES.has(participant.status ?? '')).length
  const agendaItemIds = agendaItems.map((item: any) => item.id)
  const amendmentIds = amendments.map((amendment: any) => amendment.id)

  const [elections, changeRequests] = await Promise.all([
    agendaItemIds.length > 0
      ? tx.run(zql.election.where('agenda_item_id', 'IN', agendaItemIds))
      : Promise.resolve([]),
    amendmentIds.length > 0
      ? tx.run(zql.change_request.where('amendment_id', 'IN', amendmentIds))
      : Promise.resolve([]),
  ])

  const openChangeRequests = changeRequests.filter((changeRequest: any) => isOpenChangeRequest(changeRequest.status)).length

  await tx.mutate.event.update({
    id: eventId,
    participant_count: participantCount,
    subscriber_count: subscribers.length,
    election_count: elections.length,
    amendment_count: amendments.length,
    open_change_request_count: openChangeRequests,
  })
}

export async function recomputeAmendmentCounters(tx: any, amendmentId: string): Promise<void> {
  const [collaborators, subscribers, clones, changeRequests, supportVotes] = await Promise.all([
    tx.run(zql.amendment_collaborator.where('amendment_id', amendmentId)),
    tx.run(zql.subscriber.where('amendment_id', amendmentId)),
    tx.run(zql.amendment.where('clone_source_id', amendmentId)),
    tx.run(zql.change_request.where('amendment_id', amendmentId)),
    tx.run(zql.amendment_support_vote.where('amendment_id', amendmentId)),
  ])

  const activeCollaborators = collaborators.filter((collaborator: any) =>
    ACTIVE_COLLABORATOR_STATUSES.has(collaborator.status ?? '')
  ).length

  await tx.mutate.amendment.update({
    id: amendmentId,
    subscriber_count: subscribers.length,
    clone_count: clones.length,
    change_request_count: changeRequests.length,
    supporters: supportVotes.length,
    collaborator_count: activeCollaborators,
  })
}

export async function recomputeBlogCounters(tx: any, blogId: string): Promise<void> {
  const [subscribers, supportVotes, threads] = await Promise.all([
    tx.run(zql.subscriber.where('blog_id', blogId)),
    tx.run(zql.blog_support_vote.where('blog_id', blogId)),
    tx.run(zql.thread.where('blog_id', blogId)),
  ])

  const threadIds = threads.map((thread: any) => thread.id)
  const comments = threadIds.length > 0
    ? await tx.run(zql.comment.where('thread_id', 'IN', threadIds))
    : []

  const supporters = supportVotes.filter((vote: any) => (vote.vote ?? 0) > 0).length

  await tx.mutate.blog.update({
    id: blogId,
    subscriber_count: subscribers.length,
    supporter_count: supporters,
    like_count: supporters,
    comment_count: comments.length,
  })
}
