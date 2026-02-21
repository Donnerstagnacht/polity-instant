import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const searchQueries = {
  searchableUsers: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.user
        .where('visibility', 'IN', ['public', 'authenticated'])
        .related('hashtags')
        .related('group_memberships')
        .related('amendment_collaborations')
        .limit(limit)
  ),

  searchableGroups: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.group
        .related('owner')
        .related('hashtags')
        .related('memberships', q => q.related('user').related('role'))
        .related('events')
        .related('amendments')
        .limit(limit)
  ),

  searchableStatements: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.statement
        .related('user')
        .limit(limit)
  ),

  searchableBlogs: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.blog
        .related('hashtags')
        .related('bloggers', q => q.related('user').related('role'))
        .related('support_votes', q => q.related('user'))
        .limit(limit)
  ),

  searchableAmendments: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.amendment
        .related('hashtags')
        .related('collaborators', q => q.related('user'))
        .related('votes', q => q.related('user'))
        .related('support_votes', q => q.related('user'))
        .related('change_requests')
        .related('group')
        .limit(limit)
  ),

  searchableEvents: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.event
        .related('creator')
        .related('group')
        .related('participants', q => q.related('user'))
        .related('hashtags')
        .related('voting_sessions', q => q.related('agenda_item').related('votes'))
        .related('event_positions', q => q.related('holders'))
        .related('scheduled_elections')
        .related('agenda_items', q => q.related('election').related('amendment'))
        .limit(limit)
  ),

  userGroupMemberships: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.group_membership
        .where('user_id', user_id)
        .related('group')
  ),

  userTodoAssignments: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.todo_assignment
        .where('user_id', user_id)
        .related('todo', q => q.related('group').related('creator').related('assignments', q => q.related('user')))
        .related('user')
  ),

  searchableTodos: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.todo
        .related('group')
        .related('creator')
        .related('assignments', q => q.related('user'))
        .limit(limit)
  ),

  searchableVotingSessions: defineQuery(
    z.object({ limit: z.number() }),
    ({ args: { limit } }) =>
      zql.event_voting_session
        .related('event')
        .related('votes', q => q.related('user'))
        .related('agenda_item', q => q.related('event').related('election').related('amendment'))
        .limit(limit)
  ),
}
