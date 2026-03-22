import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface AmendmentStateOptions {
  amendmentId?: string
  userId?: string

  // Detail view variants (pick one or none — these control which top-level amendment query runs)
  includeFullRelations?: boolean       // byIdFull – wiki view
  includeProcessData?: boolean         // byIdWithProcessData – process flow
  includeDocsAndCollabs?: boolean      // byIdWithDocsAndCollabs – editor
  includePathViz?: boolean             // byIdWithPathViz – path visualization

  // Optional data slices
  includeClones?: boolean
  includeThreads?: boolean
  includeDocuments?: boolean
  includeChangeRequestsWithVotes?: boolean
  includeRoles?: boolean
  includeAmendmentVotes?: boolean
  includeSupportConfirmations?: boolean
  includeDocumentVersions?: boolean
  includeCollaboratorsByUser?: boolean

  // Group support confirmations
  includeSupportConfirmationsByGroup?: boolean

  // Network / cross-domain data
  includeNetworkData?: boolean         // allGroups + allGroupRelationships + allGroupMemberships + allEvents
  includeUserMemberships?: boolean     // userGroupMemberships (requires userId)
  includeAllUsers?: boolean
  includeEventsByGroup?: boolean       // eventsByGroup (requires eventGroupId)

  // Dynamic filter params
  documentId?: string                  // for documentVersionsByDocument
  eventGroupId?: string                // for eventsByGroup
  groupId?: string                     // for supportConfirmationsByGroup
}

/**
 * Reactive state hook for amendment data.
 * Returns all query-derived state — no mutations.
 *
 * Pass an options object to opt-in to additional data slices.
 */
export function useAmendmentState(options: AmendmentStateOptions = {}) {
  const {
    amendmentId,
    userId,
    includeFullRelations,
    includeProcessData,
    includeDocsAndCollabs,
    includePathViz,
    includeClones,
    includeThreads,
    includeDocuments,
    includeChangeRequestsWithVotes,
    includeRoles,
    includeAmendmentVotes,
    includeSupportConfirmations,
    includeDocumentVersions,
    includeCollaboratorsByUser,
    includeSupportConfirmationsByGroup,
    includeNetworkData,
    includeUserMemberships,
    includeAllUsers,
    includeEventsByGroup,
    documentId,
    eventGroupId,
    groupId,
  } = options

  // ── Core amendment data ──────────────────────────────────────────
  const [amendment, amendmentResult] = useQuery(
    amendmentId
      ? queries.amendments.byIdWithRelations({ id: amendmentId })
      : undefined
  )

  const [allCollaborators, collabResult] = useQuery(
    amendmentId
      ? queries.amendments.collaborators({ amendment_id: amendmentId })
      : undefined
  )

  const [userCollabRows] = useQuery(
    amendmentId && userId
      ? queries.amendments.userCollaboration({
          amendment_id: amendmentId,
          user_id: userId,
        })
      : undefined
  )

  const [subscribers, subscriberResult] = useQuery(
    amendmentId
      ? queries.amendments.subscribers({ amendment_id: amendmentId })
      : undefined
  )

  // ── Detail view variants (opt-in) ───────────────────────────────
  const [amendmentFull] = useQuery(
    includeFullRelations && amendmentId
      ? queries.amendments.byIdFull({ id: amendmentId })
      : undefined
  )

  const [amendmentProcess] = useQuery(
    includeProcessData && amendmentId
      ? queries.amendments.byIdWithProcessData({ id: amendmentId })
      : undefined
  )

  const [amendmentDocsCollabs] = useQuery(
    includeDocsAndCollabs && amendmentId
      ? queries.amendments.byIdWithDocsAndCollabs({ id: amendmentId })
      : undefined
  )

  const [amendmentPathViz] = useQuery(
    includePathViz && amendmentId
      ? queries.amendments.byIdWithPathViz({ id: amendmentId })
      : undefined
  )

  // ── Optional data slices ─────────────────────────────────────────
  const [clones] = useQuery(
    includeClones && amendmentId
      ? queries.amendments.clonesBySource({ source_id: amendmentId })
      : undefined
  )

  const [threads] = useQuery(
    includeThreads && amendmentId
      ? queries.amendments.threads({ amendment_id: amendmentId })
      : undefined
  )

  const [documents] = useQuery(
    includeDocuments && amendmentId
      ? queries.amendments.documentsByAmendment({ amendment_id: amendmentId })
      : undefined
  )

  const [changeRequestsWithVotes] = useQuery(
    includeChangeRequestsWithVotes && amendmentId
      ? queries.amendments.changeRequestsWithVotes({ amendment_id: amendmentId })
      : undefined
  )

  const [roles] = useQuery(
    includeRoles && amendmentId
      ? queries.amendments.rolesByAmendment({ amendment_id: amendmentId })
      : undefined
  )

  // TODO: Removed with voting session migration
  const amendmentVotes = undefined

  const [supportConfirmations] = useQuery(
    includeSupportConfirmations && userId
      ? queries.amendments.supportConfirmationsByUser({ user_id: userId })
      : undefined
  )

  const [documentVersions] = useQuery(
    includeDocumentVersions && documentId
      ? queries.amendments.documentVersionsByDocument({ document_id: documentId })
      : undefined
  )

  const [collaboratorsByUser] = useQuery(
    includeCollaboratorsByUser && userId
      ? queries.amendments.collaboratorsByUser({ user_id: userId })
      : undefined
  )

  const [supportConfirmationsByGroup] = useQuery(
    includeSupportConfirmationsByGroup && groupId
      ? queries.amendments.supportConfirmations({ group_id: groupId, status: 'pending' })
      : undefined
  )

  // ── Network / cross-domain data (opt-in) ─────────────────────────
  const [allGroups] = useQuery(
    includeNetworkData
      ? queries.amendments.allGroups({})
      : undefined
  )

  const [allGroupRelationships] = useQuery(
    includeNetworkData
      ? queries.amendments.allGroupRelationships({})
      : undefined
  )

  const [allGroupMemberships] = useQuery(
    includeNetworkData
      ? queries.amendments.allGroupMemberships({})
      : undefined
  )

  const [allEvents] = useQuery(
    includeNetworkData
      ? queries.amendments.allEvents({})
      : undefined
  )

  const [userMemberships] = useQuery(
    includeUserMemberships && userId
      ? queries.amendments.userGroupMemberships({ user_id: userId })
      : undefined
  )

  const [allUsersData] = useQuery(
    includeAllUsers
      ? queries.amendments.allUsers({})
      : undefined
  )

  const [eventsByGroup] = useQuery(
    includeEventsByGroup && eventGroupId
      ? queries.amendments.eventsByGroup({ group_id: eventGroupId })
      : undefined
  )

  // ── Derived state ────────────────────────────────────────────────
  const collaboration = userCollabRows?.[0] ?? null
  const status = (collaboration?.status as 'invited' | 'requested' | 'member' | 'admin') ?? null
  const isCollaborator = status === 'member' || status === 'admin'
  const isAdmin = status === 'admin'
  const hasRequested = status === 'requested'
  const isInvited = status === 'invited'

  const collaborators = useMemo(() => allCollaborators ?? [], [allCollaborators])

  const collaboratorCount = useMemo(
    () =>
      collaborators.filter(
        c => c.status === 'member' || c.status === 'admin'
      ).length,
    [collaborators]
  )

  const collaboratorStats = useMemo(() => {
    const stats = { total: collaborators.length, admins: 0, members: 0, invited: 0 }
    collaborators.forEach(c => {
      if (c.status === 'admin') stats.admins++
      if (c.status === 'member') stats.members++
      if (c.status === 'invited') stats.invited++
    })
    return stats
  }, [collaborators])

  const changeRequests = useMemo(
    () => amendment?.change_requests ?? [],
    [amendment]
  )

  const discussions = useMemo(
    () => amendment?.threads ?? [],
    [amendment]
  )

  const isSubscribed = useMemo(
    () =>
      userId
        ? (subscribers ?? []).some(s => s.subscriber_user?.id === userId)
        : false,
    [subscribers, userId]
  )

  const subscriberCount = subscribers?.length ?? 0

  const isLoading =
    (amendmentId !== undefined && amendmentResult.type === 'unknown') ||
    (amendmentId !== undefined && collabResult.type === 'unknown')

  return {
    // Core data
    amendment,
    collaborators,
    changeRequests,
    discussions,

    // Collaboration state
    collaboration,
    status,
    isCollaborator,
    isAdmin,
    hasRequested,
    isInvited,
    collaboratorCount,
    collaboratorStats,

    // Subscription state
    subscribers,
    isSubscribed,
    subscriberCount,

    // Detail views
    amendmentFull,
    amendmentProcess,
    amendmentDocsCollabs,
    amendmentPathViz,

    // Optional slices
    clones: clones ?? [],
    threads: threads ?? [],
    documents: documents ?? [],
    changeRequestsWithVotes: changeRequestsWithVotes ?? [],
    roles: roles ?? [],
    amendmentVotes: amendmentVotes ?? [],
    supportConfirmations: supportConfirmations ?? [],
    documentVersions: documentVersions ?? [],
    collaboratorsByUser: collaboratorsByUser ?? [],
    supportConfirmationsByGroup: supportConfirmationsByGroup ?? [],

    // Network / cross-domain
    allGroups: allGroups ?? [],
    allGroupRelationships: allGroupRelationships ?? [],
    allGroupMemberships: allGroupMemberships ?? [],
    allEvents: allEvents ?? [],
    userMemberships: userMemberships ?? [],
    allUsers: allUsersData ?? [],
    eventsByGroup: eventsByGroup ?? [],

    // Loading
    isLoading,
  }
}
