import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface StatementStateOptions {
  id?: string
  groupId?: string
  userId?: string
  visibility?: string
  includeDetails?: boolean
  includeHashtags?: boolean
}

/**
 * Reactive state hook for statement data.
 * Returns query-derived state — no mutations.
 */
export function useStatementState(options: StatementStateOptions = {}) {
  const { id, groupId, userId, visibility, includeDetails, includeHashtags } = options

  const [statements, statementsResult] = useQuery(
    queries.statements.byUser({})
  )

  const [statementsByGroup, statementsByGroupResult] = useQuery(
    groupId ? queries.statements.byGroup({ group_id: groupId }) : undefined
  )

  const [statementsByUser, statementsByUserResult] = useQuery(
    userId ? queries.statements.byUserId({ user_id: userId }) : undefined
  )

  const [statement, statementResult] = useQuery(
    id ? queries.statements.byId({ id }) : undefined
  )

  const [statementWithDetails, statementWithDetailsResult] = useQuery(
    includeDetails && id
      ? queries.statements.byIdWithDetails({ id })
      : undefined
  )

  const [statementWithHashtags, statementWithHashtagsResult] = useQuery(
    includeHashtags && id
      ? queries.statements.byIdWithHashtags({ id })
      : undefined
  )

  const [byVisibility, byVisibilityResult] = useQuery(
    visibility
      ? queries.statements.byVisibility({ visibility })
      : undefined
  )

  const isLoading =
    statementsResult.type === 'unknown' ||
    (id != null && statementResult.type === 'unknown') ||
    (groupId != null && statementsByGroupResult.type === 'unknown') ||
    (userId != null && statementsByUserResult.type === 'unknown') ||
    (includeDetails && id != null && statementWithDetailsResult.type === 'unknown') ||
    (includeHashtags && id != null && statementWithHashtagsResult.type === 'unknown') ||
    (visibility != null && byVisibilityResult.type === 'unknown')

  return {
    statements,
    statementsByGroup,
    statementsByUser,
    statement,
    statementWithDetails,
    statementWithHashtags,
    byVisibility,
    isLoading,
  }
}
