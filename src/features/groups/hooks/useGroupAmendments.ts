'use client';

import db from '../../../../db/db';

/**
 * Hook to fetch amendments for a group with cursor-based pagination
 * @param groupId - The ID of the group
 * @param cursor - Cursor pagination config
 */
export function useGroupAmendments(
  groupId: string,
  cursor: { after?: string; first: number } = { first: 20 }
) {
  const { data, isLoading, error, pageInfo } = db.useQuery({
    amendments: {
      $: {
        where: {
          'groups.id': groupId,
        },
        ...cursor,
      },
      hashtags: {},
      owner: {},
    },
  });

  return {
    amendments: data?.amendments || [],
    isLoading,
    error,
    pageInfo,
  };
}
