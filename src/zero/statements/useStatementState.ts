import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for statement data.
 * Returns query-derived state — no mutations.
 */
export function useStatementState(args: {
  id?: string
  visibility?: string
  tag?: string
}) {
  const [byUser, byUserResult] = useQuery(queries.statements.byUser({}))

  const [byId, byIdResult] = useQuery(
    args.id ? queries.statements.byId({ id: args.id }) : undefined
  )

  const [byVisibility, byVisibilityResult] = useQuery(
    args.visibility
      ? queries.statements.byVisibility({ visibility: args.visibility })
      : undefined
  )

  const [searchResults, searchResult] = useQuery(
    args.tag ? queries.statements.search({ tag: args.tag }) : undefined
  )

  const isLoading =
    byUserResult.type === 'unknown' ||
    (args.id != null && byIdResult.type === 'unknown') ||
    (args.visibility != null && byVisibilityResult.type === 'unknown') ||
    (args.tag != null && searchResult.type === 'unknown')

  return {
    statements: byUser,
    statement: byId,
    byVisibility,
    searchResults,
    isLoading,
  }
}
