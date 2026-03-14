import { useGroupAmendments as useFacadeGroupAmendments } from '@/zero/groups/useGroupState'

/**
 * Hook to fetch amendments for a group
 */
export function useGroupAmendments(
  groupId: string,
  _cursor: { after?: string; first: number } = { first: 20 }
) {
  const { amendments, isLoading } = useFacadeGroupAmendments(groupId)

  return {
    amendments,
    isLoading,
    error: undefined,
    pageInfo: undefined,
  }
}
