import { useMemo } from 'react';
import { useUserState } from '@/zero/users/useUserState';
import { useGroupState } from '@/zero/groups/useGroupState';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import type { TypeaheadItem, EntityType } from '@/features/shared/logic/typeaheadHelpers';

interface UseTypeaheadDataOptions {
  entityTypes: EntityType[];
}

/**
 * Encapsulates conditional data fetching based on requested entity types.
 * Merges multiple data sources into a unified TypeaheadItem[] shape.
 */
export function useTypeaheadData({ entityTypes }: UseTypeaheadDataOptions) {
  const includeUsers = entityTypes.includes('user');
  const includeGroups = entityTypes.includes('group');

  const { allUsers } = useUserState({
    includeAllUsers: includeUsers,
  });

  const { searchResults } = useGroupState({
    includeSearch: includeGroups,
  });

  const items = useMemo<TypeaheadItem[]>(() => {
    const result: TypeaheadItem[] = [];

    if (includeUsers && allUsers) {
      for (const user of allUsers) {
        result.push({
          id: user.id,
          entityType: 'user',
          label: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.handle || 'User',
          secondaryLabel: user.handle ? `@${user.handle}` : undefined,
          avatar: user.avatar,
          hashtags: extractHashtagTags((user as any).user_hashtags),
        });
      }
    }

    if (includeGroups && searchResults) {
      for (const group of searchResults) {
        result.push({
          id: group.id,
          entityType: 'group',
          label: group.name || 'Group',
          secondaryLabel: group.description?.substring(0, 60) || undefined,
          avatar: group.image_url,
          hashtags: extractHashtagTags((group as any).group_hashtags),
        });
      }
    }

    return result;
  }, [includeUsers, includeGroups, allUsers, searchResults]);

  return { items };
}
