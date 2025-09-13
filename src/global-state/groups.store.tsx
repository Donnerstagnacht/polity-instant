import { create } from 'zustand';
import type { UserGroup } from '@/features/user/types/user.types';

// Mock data for groups - in a real app this would come from an API
const MOCK_GROUPS: UserGroup[] = [
  {
    id: 1,
    name: 'Constitutional Reform Network',
    members: 1243,
    role: 'Member',
    description: 'Working to modernize constitutional frameworks across Europe',
    tags: ['constitution', 'reform', 'policy', 'governance'],
    amendments: 8,
    events: 12,
    abbr: 'CRN',
  },
  {
    id: 2,
    name: 'Democracy Innovations Lab',
    members: 567,
    role: 'Member',
    description: 'Researching new forms of democratic participation',
    tags: ['democracy', 'innovation', 'research', 'participation'],
    amendments: 3,
    events: 5,
    abbr: 'DIL',
  },
  {
    id: 3,
    name: 'Judicial Independence Initiative',
    members: 389,
    role: 'Member',
    description: 'Advocating for stronger protections for courts worldwide',
    tags: ['judiciary', 'independence', 'advocacy', 'courts'],
    amendments: 4,
    events: 2,
    abbr: 'JII',
  },
  {
    id: 4,
    name: 'Climate Action Coalition',
    members: 2156,
    role: 'Member',
    description: 'Pushing for immediate climate policy reforms',
    tags: ['climate', 'environment', 'sustainability', 'policy'],
    amendments: 15,
    events: 23,
    abbr: 'CAC',
  },
  {
    id: 5,
    name: 'Digital Rights Forum',
    members: 892,
    role: 'Member',
    description: 'Protecting digital privacy and freedom online',
    tags: ['digital', 'privacy', 'technology', 'rights'],
    amendments: 6,
    events: 8,
    abbr: 'DRF',
  },
  {
    id: 6,
    name: 'Education Reform Alliance',
    members: 1445,
    role: 'Member',
    description: 'Advocating for modern education systems',
    tags: ['education', 'reform', 'schools', 'policy'],
    amendments: 9,
    events: 14,
    abbr: 'ERA',
  },
];

interface GroupsState {
  groups: UserGroup[];
  loading: boolean;
  searchTerm: string;
  selectedTags: string[];

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  fetchGroups: () => Promise<void>;
  getFilteredGroups: () => UserGroup[];
  getAllTags: () => string[];
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  loading: false,
  searchTerm: '',
  selectedTags: [],

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),

  toggleTag: (tag: string) => {
    const { selectedTags } = get();
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    set({ selectedTags: newTags });
  },

  fetchGroups: async () => {
    set({ loading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ groups: MOCK_GROUPS, loading: false });
  },

  getFilteredGroups: () => {
    const { groups, searchTerm, selectedTags } = get();

    return groups.filter(group => {
      // Filter by search term
      const matchesSearch =
        searchTerm === '' ||
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by selected tags
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every(selectedTag =>
          group.tags?.some(groupTag => groupTag.toLowerCase().includes(selectedTag.toLowerCase()))
        );

      return matchesSearch && matchesTags;
    });
  },

  getAllTags: () => {
    const { groups } = get();
    const allTags = groups.flatMap(group => group.tags || []);
    return [...new Set(allTags)].sort();
  },
}));
