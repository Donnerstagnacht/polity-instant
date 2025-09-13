import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupsStore } from '@/global-state/groups.store';

describe('Groups Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGroupsStore.getState();
    store.setSearchTerm('');
    store.setSelectedTags([]);
  });

  it('should initialize with empty state', () => {
    const store = useGroupsStore.getState();
    expect(store.groups).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.searchTerm).toBe('');
    expect(store.selectedTags).toEqual([]);
  });

  it('should update search term', () => {
    const store = useGroupsStore.getState();
    store.setSearchTerm('democracy');
    expect(store.searchTerm).toBe('democracy');
  });

  it('should toggle tags', () => {
    const store = useGroupsStore.getState();

    // Add a tag
    store.toggleTag('democracy');
    expect(store.selectedTags).toContain('democracy');

    // Remove the tag
    store.toggleTag('democracy');
    expect(store.selectedTags).not.toContain('democracy');
  });

  it('should filter groups by search term', async () => {
    const store = useGroupsStore.getState();

    // Load groups first
    await store.fetchGroups();
    expect(store.groups.length).toBeGreaterThan(0);

    // Search for "democracy"
    store.setSearchTerm('democracy');
    const filtered = store.getFilteredGroups();

    // Should return groups that match the search term
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every(
        group =>
          group.name.toLowerCase().includes('democracy') ||
          group.description?.toLowerCase().includes('democracy') ||
          group.tags?.some(tag => tag.toLowerCase().includes('democracy'))
      )
    ).toBe(true);
  });

  it('should filter groups by tags', async () => {
    const store = useGroupsStore.getState();

    // Load groups first
    await store.fetchGroups();

    // Filter by 'policy' tag
    store.setSelectedTags(['policy']);
    const filtered = store.getFilteredGroups();

    // Should only return groups with the policy tag
    expect(
      filtered.every(group => group.tags?.some(tag => tag.toLowerCase().includes('policy')))
    ).toBe(true);
  });

  it('should get all unique tags from groups', async () => {
    const store = useGroupsStore.getState();

    // Load groups first
    await store.fetchGroups();

    const allTags = store.getAllTags();
    expect(allTags.length).toBeGreaterThan(0);

    // Should not have duplicates
    expect(new Set(allTags).size).toBe(allTags.length);
  });
});
