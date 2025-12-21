'use client';

import db from '../../../../db/db';

/**
 * Hook to fetch amendments for a group
 * @param groupId - The ID of the group
 */
export function useGroupAmendments(groupId: string) {
  const { data, isLoading, error } = db.useQuery({
    amendments: {
      $: {
        where: {
          'groups.id': groupId,
        },
      },
      hashtags: {},
      owner: {},
    },
  });

  return {
    amendments: data?.amendments || [],
    isLoading,
    error,
  };
}
