/**
 * Shared helpers for server-side mutator overrides.
 * Provides DB lookup functions used across domain server-mutators.
 */
import { zql } from './schema'

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
