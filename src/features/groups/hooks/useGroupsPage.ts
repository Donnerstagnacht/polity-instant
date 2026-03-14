import { useState, useMemo } from 'react';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface GroupDisplay {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  eventCount?: number;
  amendmentCount?: number;
  topics?: string[];
}

export function useGroupsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { searchResults, isLoading } = useGroupState({ includeSearch: true });

  const groups: GroupDisplay[] = useMemo(
    () =>
      (searchResults ?? []).map(g => ({
        id: g.id,
        name: g.name ?? '',
        description: g.description ?? '',
        memberCount: g.member_count ?? 0,
        eventCount: g.event_count ?? 0,
        amendmentCount: g.amendment_count ?? 0,
        topics: [],
      })),
    [searchResults]
  );

  const allTags = useMemo(() => {
    const tags = groups.flatMap(g => g.topics ?? []);
    return [...new Set(tags)].sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch =
        !searchTerm ||
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.topics?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every(selectedTag =>
          group.topics?.some(groupTag =>
            groupTag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        );

      return matchesSearch && matchesTags;
    });
  }, [groups, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchTerm !== '' || selectedTags.length > 0;

  return {
    t,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    toggleTag,
    clearAllFilters,
    hasActiveFilters,
    allTags,
    filteredGroups,
  };
}
