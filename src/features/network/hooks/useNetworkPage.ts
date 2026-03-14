import { useState, useMemo, useCallback } from 'react';
import { useGroupNetwork } from './useGroupNetwork';
import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useAuth } from '@/providers/auth-provider';
import { RIGHT_TYPES } from '@/features/network/ui/RightFilters';
import type { NetworkTab, NormalizedGroupRelationship } from '../types/network.types';

interface GroupedRelationshipRequests {
  group: any;
  rels: NormalizedGroupRelationship[];
  type: 'parent' | 'child';
}

export function useNetworkPage(groupId: string) {
  const { user: authUser } = useAuth();
  const { group } = useGroupData(groupId);
  const { updateRelationship, deleteRelationship } = useGroupActions();

  const {
    networkData,
    showIndirect,
    setShowIndirect,
    selectedRights,
    toggleRight,
    activeRelationships,
    incomingRequests,
    outgoingRequests,
    allRelationships,
    isLoading,
  } = useGroupNetwork(groupId);

  // Tab state
  const [activeTab, setActiveTab] = useState<NetworkTab>('current-network');

  // Search & filter state for manage tab
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'parent' | 'child'>('all');
  const [manageRightFilter, setManageRightFilter] = useState<Set<string>>(
    new Set(RIGHT_TYPES)
  );

  const toggleManageRightFilter = useCallback((right: string) => {
    setManageRightFilter(prev => {
      const next = new Set(prev);
      if (next.has(right)) {
        next.delete(right);
      } else {
        next.add(right);
      }
      return next;
    });
  }, []);

  // Group incoming requests by source group
  const groupedIncoming = useMemo(() => {
    const groups = new Map<string, GroupedRelationshipRequests>();
    incomingRequests.forEach(rel => {
      const isParent = rel.childGroup?.id === groupId;
      const otherGroup = isParent ? rel.parentGroup : rel.childGroup;
      if (!otherGroup) return;

      if (!groups.has(otherGroup.id)) {
        groups.set(otherGroup.id, {
          group: otherGroup,
          rels: [],
          type: isParent ? 'parent' : 'child',
        });
      }
      const entry = groups.get(otherGroup.id)!;
      entry.rels.push(rel);
    });
    return Array.from(groups.values());
  }, [incomingRequests, groupId]);

  // Group outgoing requests by target group
  const groupedOutgoing = useMemo(() => {
    const groups = new Map<string, GroupedRelationshipRequests>();
    outgoingRequests.forEach(rel => {
      const isParent = rel.childGroup?.id === groupId;
      const otherGroup = isParent ? rel.parentGroup : rel.childGroup;
      if (!otherGroup) return;

      if (!groups.has(otherGroup.id)) {
        groups.set(otherGroup.id, {
          group: otherGroup,
          rels: [],
          type: isParent ? 'parent' : 'child',
        });
      }
      const entry = groups.get(otherGroup.id)!;
      entry.rels.push(rel);
    });
    return Array.from(groups.values());
  }, [outgoingRequests, groupId]);

  // Filtered active relationships for manage tab
  const filteredRelationships = useMemo(() => {
    let items: { group: any; rights: string[]; type: 'parent' | 'child' }[] = [];

    if (directionFilter !== 'child') {
      items = items.concat(
        networkData.parents.map(p => ({ ...p, type: 'parent' as const }))
      );
    }
    if (directionFilter !== 'parent') {
      items = items.concat(
        networkData.children.map(c => ({ ...c, type: 'child' as const }))
      );
    }

    // Filter by right type
    items = items
      .map(item => ({
        ...item,
        rights: item.rights.filter(r => manageRightFilter.has(r)),
      }))
      .filter(item => item.rights.length > 0);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.group.name?.toLowerCase().includes(query) ||
          item.group.description?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [networkData, directionFilter, manageRightFilter, searchQuery]);

  // Filtered incoming/outgoing by search and right filters
  const filteredIncoming = useMemo(() => {
    if (!searchQuery.trim() && manageRightFilter.size === RIGHT_TYPES.length)
      return groupedIncoming;

    const query = searchQuery.toLowerCase();
    return groupedIncoming
      .map(entry => ({
        ...entry,
        rels: entry.rels.filter(rel => manageRightFilter.has(rel.withRight)),
      }))
      .filter(
        entry =>
          entry.rels.length > 0 &&
          (!query || entry.group.name?.toLowerCase().includes(query))
      );
  }, [groupedIncoming, searchQuery, manageRightFilter]);

  const filteredOutgoing = useMemo(() => {
    if (!searchQuery.trim() && manageRightFilter.size === RIGHT_TYPES.length)
      return groupedOutgoing;

    const query = searchQuery.toLowerCase();
    return groupedOutgoing
      .map(entry => ({
        ...entry,
        rels: entry.rels.filter(rel => manageRightFilter.has(rel.withRight)),
      }))
      .filter(
        entry =>
          entry.rels.length > 0 &&
          (!query || entry.group.name?.toLowerCase().includes(query))
      );
  }, [groupedOutgoing, searchQuery, manageRightFilter]);

  // Handlers
  const handleAcceptRequest = useCallback(
    async (rels: any[]) => {
      for (const rel of rels) {
        await updateRelationship({ id: rel.id, status: 'active' });
      }
    },
    [updateRelationship]
  );

  const handleRejectRequest = useCallback(
    async (rels: any[]) => {
      for (const rel of rels) {
        await deleteRelationship({ id: rel.id });
      }
    },
    [deleteRelationship]
  );

  const handleDeleteRelationship = useCallback(
    async (targetGroupId: string) => {
      const rels = activeRelationships.filter(
        rel =>
          (rel.parentGroup?.id === groupId && rel.childGroup?.id === targetGroupId) ||
          (rel.childGroup?.id === groupId && rel.parentGroup?.id === targetGroupId)
      );
      for (const rel of rels) {
        await deleteRelationship({ id: rel.id });
      }
    },
    [activeRelationships, groupId, deleteRelationship]
  );

  return {
    // Auth
    authUser,
    // Group
    group,
    groupId,
    groupName: group?.name || 'Group',
    isLoading,

    // Tab
    activeTab,
    setActiveTab,

    // Network graph (for current-network tab)
    networkData,
    showIndirect,
    setShowIndirect,
    selectedRights,
    toggleRight,

    // Manage tab data
    searchQuery,
    setSearchQuery,
    directionFilter,
    setDirectionFilter,
    manageRightFilter,
    toggleManageRightFilter,

    // Relationships
    allRelationships,
    filteredRelationships,
    filteredIncoming,
    filteredOutgoing,

    // Handlers
    handleAcceptRequest,
    handleRejectRequest,
    handleDeleteRelationship,
  };
}
