import { useMemo } from 'react';
import { useUserState } from '@/zero/users/useUserState';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useAllEvents, useAllAmendments, usePositionsWithGroups } from '@/zero/events/useEventState';
import { useElectionState } from '@/zero/elections/useElectionState';
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
  const includeEvents = entityTypes.includes('event');
  const includeAmendments = entityTypes.includes('amendment');
  const includeElections = entityTypes.includes('election');
  const includePositions = entityTypes.includes('position');

  const { allUsers } = useUserState({
    includeAllUsers: includeUsers,
  });

  const { searchResults } = useGroupState({
    includeSearch: includeGroups,
  });

  const { events } = useAllEvents();
  const { amendments } = useAllAmendments();
  const { positions } = usePositionsWithGroups();
  const { pendingElections } = useElectionState({
    includePendingElections: includeElections,
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
          hashtags: extractHashtagTags((user as { user_hashtags?: ReadonlyArray<{ hashtag?: { tag?: string | null } | null }> }).user_hashtags),
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
          hashtags: extractHashtagTags((group as { group_hashtags?: ReadonlyArray<{ hashtag?: { tag?: string | null } | null }> }).group_hashtags),
        });
      }
    }

    if (includeEvents && events) {
      for (const event of events) {
        result.push({
          id: event.id,
          entityType: 'event',
          label: event.title || 'Event',
          secondaryLabel: event.description?.substring(0, 60) || undefined,
          avatar: null,
        });
      }
    }

    if (includeAmendments && amendments) {
      for (const amendment of amendments) {
        result.push({
          id: amendment.id,
          entityType: 'amendment',
          label: amendment.title || 'Amendment',
          secondaryLabel: amendment.reason?.substring(0, 60) || undefined,
          avatar: null,
        });
      }
    }

    if (includeElections && pendingElections) {
      for (const election of pendingElections) {
        result.push({
          id: election.id,
          entityType: 'election',
          label: election.title || 'Election',
          secondaryLabel: election.description?.substring(0, 60) || undefined,
          avatar: null,
        });
      }
    }

    if (includePositions && positions) {
      for (const position of positions) {
        result.push({
          id: position.id,
          entityType: 'position',
          label: position.title || 'Position',
          secondaryLabel: position.description?.substring(0, 60) || undefined,
          avatar: null,
        });
      }
    }

    return result;
  }, [includeUsers, includeGroups, includeEvents, includeAmendments, includeElections, includePositions, allUsers, searchResults, events, amendments, pendingElections, positions]);

  return { items };
}
