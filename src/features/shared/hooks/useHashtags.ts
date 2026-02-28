import { useState, useCallback, useMemo } from 'react';
import { useCommonState } from '@/zero/common/useCommonState';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';

interface UseHashtagsOptions {
  entityType: 'user' | 'group' | 'amendment' | 'event' | 'blog' | 'statement';
  entityId?: string;
}

/**
 * Reusable hook for hashtag management on any entity.
 * Wraps common state (all hashtags + entity hashtags) and sync action.
 */
export function useHashtags({ entityType, entityId }: UseHashtagsOptions) {
  const { allHashtags } = useCommonState({ loadAllHashtags: true });
  const { syncEntityHashtags } = useCommonActions();
  const [tags, setTags] = useState<string[]>([]);

  const suggestions = useMemo(
    () => (allHashtags ?? []).map(h => h.tag),
    [allHashtags],
  );

  const syncHashtags = useCallback(async () => {
    if (!entityId) return;
    await syncEntityHashtags(
      entityType,
      entityId,
      tags,
      [],
      allHashtags ?? [],
    );
  }, [entityType, entityId, tags, allHashtags, syncEntityHashtags]);

  return {
    allHashtags: allHashtags ?? [],
    suggestions,
    tags,
    setTags,
    syncHashtags,
  };
}
