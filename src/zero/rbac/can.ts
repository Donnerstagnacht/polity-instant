/**
 * Server-side Permission Check for Zero Mutators
 *
 * Use `can()` inside mutator handlers to enforce permissions.
 * On the server, it queries the DB for roles/action_rights and throws PermissionError on failure.
 * On the client (optimistic), it skips checks (the authoritative server run is what matters).
 *
 * @example
 * ```ts
 * // In a mutator:
 * delete: defineMutator(schema, async ({ tx, ctx, args }) => {
 *   await can(tx, ctx, { action: 'manage', resource: 'groups', groupId: args.groupId })
 *   await tx.mutate.group.delete({ id: args.id })
 * })
 * ```
 */

import { createBuilder, type Transaction } from '@rocicorp/zero'
import { schema, type Schema } from '../schema'
import { checkPermission, type PermissionData } from './check'
import { PermissionError } from './errors'
import type { ResourceType, ActionType, Membership, ActionRight } from './types'

// Build zql inside this module to avoid circular imports with schema.ts
const zql = createBuilder(schema)

// ============================================================================
// Types
// ============================================================================

/** What permission to check. */
export interface PermissionCheck {
  action: ActionType
  resource: ResourceType
  groupId?: string | null
  eventId?: string | null
  blogId?: string | null
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Check a permission inside a mutator. Throws PermissionError on failure.
 *
 * On client (optimistic): skips check — the server run is authoritative.
 * On server: queries the DB for the user's roles and checks against them.
 */
export async function can(
  tx: Transaction<Schema>,
  ctx: { readonly userID: string },
  check: PermissionCheck,
): Promise<void> {
  // Skip permission checks on client — server is authoritative
  if (tx.location === 'client') return

  const { userID } = ctx
  if (!userID || userID === 'anon') {
    throw new PermissionError(check.action, check.resource, 'authentication required')
  }

  const data = await loadPermissionData(tx, userID, check)

  const groupId = check.groupId ?? undefined
  const eventId = check.eventId ?? undefined
  const blogId = check.blogId ?? undefined

  const allowed = checkPermission(
    data,
    { groupId, eventId, blogId },
    check.action,
    check.resource,
  )

  if (!allowed) {
    const scopeLabel = groupId
      ? `group:${groupId}`
      : eventId
        ? `event:${eventId}`
        : blogId
          ? `blog:${blogId}`
          : undefined
    throw new PermissionError(check.action, check.resource, scopeLabel)
  }
}

// ============================================================================
// Data Loading (server-only, runs in tx)
// ============================================================================

async function loadPermissionData(
  tx: Transaction<Schema>,
  userId: string,
  check: PermissionCheck,
): Promise<PermissionData> {
  const data: PermissionData = { userId }

  if (check.groupId) {
    data.memberships = await loadGroupMemberships(tx, userId, check.groupId)
  }

  if (check.eventId) {
    data.participations = await loadEventParticipations(tx, userId, check.eventId)
  }

  if (check.blogId) {
    data.bloggerRelations = await loadBloggerRelations(tx, userId, check.blogId)
  }

  return data
}

async function loadGroupMemberships(
  tx: Transaction<Schema>,
  userId: string,
  groupId: string,
): Promise<Membership[]> {
  const rows: any[] = await tx.run(
    zql.group_membership
      .where('user_id', userId)
      .where('group_id', groupId)
      .related('role', q => q.related('action_rights'))
      .related('group'),
  )

  return rows.map(m => ({
    id: m.id,
    group: m.group ? { id: m.group.id } : undefined,
    role: m.role
      ? {
          id: m.role.id,
          name: m.role.name,
          description: m.role.description,
          scope: m.role.scope,
          actionRights: mapActionRights(m.role.action_rights),
        }
      : undefined,
  }))
}

async function loadEventParticipations(
  tx: Transaction<Schema>,
  userId: string,
  eventId: string,
) {
  const rows: any[] = await tx.run(
    zql.event_participant
      .where('user_id', userId)
      .where('event_id', eventId)
      .related('role', q => q.related('action_rights'))
      .related('event'),
  )

  return rows.map(p => ({
    id: p.id,
    event: p.event ? { id: p.event.id } : undefined,
    role: p.role
      ? {
          id: p.role.id,
          name: p.role.name,
          description: p.role.description,
          scope: p.role.scope,
          actionRights: mapActionRights(p.role.action_rights),
        }
      : undefined,
  }))
}

async function loadBloggerRelations(
  tx: Transaction<Schema>,
  userId: string,
  blogId: string,
) {
  const rows: any[] = await tx.run(
    zql.blog_blogger
      .where('user_id', userId)
      .where('blog_id', blogId)
      .related('role', q => q.related('action_rights'))
      .related('blog'),
  )

  return rows.map(b => ({
    id: b.id,
    blog: b.blog ? { id: b.blog.id } : undefined,
    role: b.role
      ? {
          id: b.role.id,
          name: b.role.name,
          description: b.role.description,
          scope: b.role.scope,
          actionRights: mapActionRights(b.role.action_rights),
        }
      : undefined,
  }))
}

function mapActionRights(raw: any[] | undefined): ActionRight[] {
  if (!raw) return []
  return raw.map((ar: any) => ({
    id: ar.id,
    resource: ar.resource,
    action: ar.action,
    group: ar.group_id ? { id: ar.group_id } : undefined,
    event: ar.event_id ? { id: ar.event_id } : undefined,
    amendment: ar.amendment_id ? { id: ar.amendment_id } : undefined,
    blog: ar.blog_id ? { id: ar.blog_id } : undefined,
  }))
}
