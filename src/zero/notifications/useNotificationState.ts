import { useQuery } from '@rocicorp/zero/react'
import { useMemo } from 'react'
import { queries } from '../queries'

/**
 * Reactive state hook for notification data.
 * Returns query-derived state — no mutations.
 *
 * Options:
 * - entityFilter: filter notifications by entity
 * - includeRelations: load notifications with all related entities
 * - includeUserNotifications: load cross-domain memberships + group notifications,
 *   combine with personal notifications, and deduplicate
 */
export function useNotificationState(options?: {
  entityFilter?: { entityId: string; entityType: string }
  entityId?: string
  includeRelations?: boolean
  includeUserNotifications?: boolean
}) {
  const includeRelations = options?.includeRelations ?? false
  const includeUserNotifications = options?.includeUserNotifications ?? false

  // ── Basic notifications ────────────────────────────────────────────
  const [notifications, notificationsResult] = useQuery(
    queries.notifications.byUser({})
  )

  const [unread, unreadResult] = useQuery(
    queries.notifications.unreadCount({})
  )

  const [settings, settingsResult] = useQuery(
    queries.notifications.settings({})
  )

  const [pushSubscriptions, pushSubscriptionsResult] = useQuery(
    queries.notifications.pushSubscriptions({})
  )

  const [entityNotifications, entityNotificationsResult] = useQuery(
    queries.notifications.byEntity({
      entityId: options?.entityFilter?.entityId ?? '',
      entityType: options?.entityFilter?.entityType ?? '',
    })
  )

  // ── By entity ID only (no type needed) ─────────────────────────────
  const [entityByIdNotifications, entityByIdResult] = useQuery(
    options?.entityId
      ? queries.notifications.byEntityId({ entity_id: options.entityId })
      : undefined
  )

  // ── Rich notifications with relations (opt-in) ────────────────────
  const [notificationsWithRelations] = useQuery(
    includeRelations || includeUserNotifications
      ? queries.notifications.byUserWithRelations({})
      : undefined
  )

  // ── Cross-domain membership queries (opt-in) ──────────────────────
  const [groupMemberships] = useQuery(
    includeUserNotifications
      ? queries.notifications.userGroupMemberships({})
      : undefined
  )

  const [eventParticipations] = useQuery(
    includeUserNotifications
      ? queries.notifications.userEventParticipations({})
      : undefined
  )

  const [amendmentCollaborations] = useQuery(
    includeUserNotifications
      ? queries.notifications.userAmendmentCollaborations({})
      : undefined
  )

  const [blogRelations] = useQuery(
    includeUserNotifications
      ? queries.notifications.userBlogRelations({})
      : undefined
  )

  // Compute entity IDs from memberships
  const entityIds = useMemo(() => {
    if (!includeUserNotifications) return null
    return {
      groupIds: (groupMemberships ?? [])
        .map(m => m.group?.id)
        .filter(Boolean) as string[],
      eventIds: (eventParticipations ?? [])
        .map(p => p.event?.id)
        .filter(Boolean) as string[],
      amendmentIds: (amendmentCollaborations ?? [])
        .map(c => c.amendment?.id)
        .filter(Boolean) as string[],
      blogIds: (blogRelations ?? [])
        .map(b => b.blog?.id)
        .filter(Boolean) as string[],
    }
  }, [includeUserNotifications, groupMemberships, eventParticipations, amendmentCollaborations, blogRelations])

  // ── Group notifications (opt-in, depends on entityIds) ─────────────
  const [groupNotifications] = useQuery(
    includeUserNotifications && entityIds && entityIds.groupIds.length > 0
      ? queries.notifications.byRecipientGroups({ groupIds: entityIds.groupIds })
      : undefined
  )

  // Combined user notifications (personal + group, deduplicated)
  const userNotifications = useMemo(() => {
    if (!includeUserNotifications) return []
    const all = [
      ...(notificationsWithRelations ?? []),
      ...(groupNotifications ?? []),
    ]
    const seen = new Set<string>()
    return all.filter(n => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
  }, [includeUserNotifications, notificationsWithRelations, groupNotifications])

  const isLoading =
    notificationsResult.type === 'unknown' ||
    unreadResult.type === 'unknown' ||
    settingsResult.type === 'unknown' ||
    pushSubscriptionsResult.type === 'unknown' ||
    entityNotificationsResult.type === 'unknown' ||
    (options?.entityId !== undefined && entityByIdResult.type === 'unknown')

  return {
    notifications,
    unread,
    settings,
    pushSubscriptions,
    entityNotifications,
    entityByIdNotifications: entityByIdNotifications ?? [],
    notificationsWithRelations: notificationsWithRelations ?? [],
    userNotifications,
    groupNotifications: groupNotifications ?? [],
    entityIds,
    isLoading,
  }
}
