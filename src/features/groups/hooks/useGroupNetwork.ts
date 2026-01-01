import { useCallback, useMemo, useState } from 'react';
import db from '../../../../db/db';
import { RIGHT_TYPES, formatRights } from '@/components/shared/RightFilters';

interface GroupRelationship {
  id: string;
  parentGroup?: { id: string; name: string; description?: string };
  childGroup?: { id: string; name: string; description?: string };
  withRight: string;
  relationshipType: string;
  status?: string; // 'active' | 'requested' | 'rejected'
  initiatorGroupId?: string;
}

export function useGroupNetwork(groupId: string) {
  const [showIndirect, setShowIndirect] = useState(false);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));

  // Fetch the specific group
  const { data: groupData } = db.useQuery({
    groups: {
      $: { where: { id: groupId } },
    },
  });

  // Fetch group relationships
  // Optimization: In a real app we might want to filter this query
  const { data: relationshipsData, isLoading } = db.useQuery({
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
  });

  const group = groupData?.groups?.[0];
  const relationships = (relationshipsData?.groupRelationships as GroupRelationship[]) || [];

  // Categorize relationships
  const { activeRelationships, incomingRequests, outgoingRequests } = useMemo(() => {
    const active: GroupRelationship[] = [];
    const incoming: GroupRelationship[] = [];
    const outgoing: GroupRelationship[] = [];

    relationships.forEach(rel => {
        // Treat undefined status as 'active' for backward compatibility
        const status = rel.status || 'active';
        
        if (status === 'active') {
            active.push(rel);
        } else if (status === 'requested') {
            if (rel.initiatorGroupId === groupId) {
                outgoing.push(rel);
            } else {
                incoming.push(rel);
            }
        }
    });

    return { activeRelationships: active, incomingRequests: incoming, outgoingRequests: outgoing };
  }, [relationships, groupId]);

  // Memoize active relationships to prevent infinite loops in graph calculation
  const stableRelationships = useMemo(() => {
    return activeRelationships;
  }, [
    activeRelationships.length,
    activeRelationships.map(r => `${r.id}-${r.parentGroup?.id}-${r.childGroup?.id}`).join(','),
  ]);

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, { group: any; rights: string[] }>();
      const childrenMap = new Map<string, { group: any; rights: string[] }>();

      stableRelationships.forEach((rel) => {
        if (rel.childGroup?.id === targetGroupId) {
          // This is a parent relationship
          const parentId = rel.parentGroup?.id;
          if (!parentId) return;

          if (!parentsMap.has(parentId) && rel.parentGroup) {
            parentsMap.set(parentId, { group: rel.parentGroup, rights: [] });
          }
          const parentEntry = parentsMap.get(parentId);
          if (parentEntry && !parentEntry.rights.includes(rel.withRight)) {
            parentEntry.rights.push(rel.withRight);
          }
        }
        if (rel.parentGroup?.id === targetGroupId) {
          // This is a child relationship
          const childId = rel.childGroup?.id;
          if (!childId) return;

          if (!childrenMap.has(childId) && rel.childGroup) {
            childrenMap.set(childId, { group: rel.childGroup, rights: [] });
          }
          const childEntry = childrenMap.get(childId);
          if (childEntry && !childEntry.rights.includes(rel.withRight)) {
            childEntry.rights.push(rel.withRight);
          }
        }
      });

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [stableRelationships]
  );

  // Build indirect (recursive) relationships
  const getIndirectRelationships = useCallback(
    (targetGroupId: string) => {
        const parentsMap = new Map<
        string,
        { group: any; rights: string[]; level: number; childId?: string }
        >();
        const childrenMap = new Map<
        string,
        { group: any; rights: string[]; level: number; parentId?: string }
        >();

      // First, get all direct relationships and their rights
      const directRels = getDirectRelationships(targetGroupId);

      // For parents: Add direct parents first (level 1), then follow chains for each right type
      directRels.parents.forEach(parent => {
        // Add the direct parent at level 1 with all its rights
        parentsMap.set(parent.group.id, {
          group: parent.group,
          rights: [...parent.rights],
          level: 1,
          childId: targetGroupId,
        });

        // Now follow each right type chain separately
        parent.rights.forEach(right => {
          const visited = new Set<string>();
          visited.add(targetGroupId);
          visited.add(parent.group.id); // Mark direct parent as visited

          const findParentsForRight = (id: string, level: number) => {
            stableRelationships.forEach((rel) => {
              if (
                rel.childGroup?.id === id &&
                rel.withRight === right &&
                rel.parentGroup?.id &&
                !visited.has(rel.parentGroup.id)
              ) {
                const parentId = rel.parentGroup.id;
                visited.add(parentId);

                // Add or update parent in map
                if (!parentsMap.has(parentId) && rel.parentGroup) {
                  parentsMap.set(parentId, {
                    group: rel.parentGroup,
                    rights: [],
                    level,
                    childId: id,
                  });
                }
                const parentEntry = parentsMap.get(parentId);
                if (parentEntry && !parentEntry.rights.includes(right)) {
                  parentEntry.rights.push(right);
                }

                // Continue searching with the same right type
                findParentsForRight(parentId, level + 1);
              }
            });
          };

          // Start from the direct parent to find its ancestors
          findParentsForRight(parent.group.id, 2);
        });
      });

      // For children: Add direct children first (level 1), then follow chains for each right type
      directRels.children.forEach(child => {
        // Add the direct child at level 1 with all its rights
        childrenMap.set(child.group.id, {
          group: child.group,
          rights: [...child.rights],
          level: 1,
          parentId: targetGroupId,
        });

        // Now follow each right type chain separately
        child.rights.forEach(right => {
          const visited = new Set<string>();
          visited.add(targetGroupId);
          visited.add(child.group.id); // Mark direct child as visited

          const findChildrenForRight = (id: string, level: number, currentParentId: string) => {
            stableRelationships.forEach((rel) => {
              if (
                rel.parentGroup?.id === id &&
                rel.withRight === right &&
                rel.childGroup?.id &&
                !visited.has(rel.childGroup.id)
              ) {
                const childId = rel.childGroup.id;
                visited.add(childId);

                // Add or update child in map
                if (!childrenMap.has(childId) && rel.childGroup) {
                  childrenMap.set(childId, {
                    group: rel.childGroup,
                    rights: [],
                    level,
                    parentId: currentParentId,
                  });
                }
                const childEntry = childrenMap.get(childId);
                if (childEntry && !childEntry.rights.includes(right)) {
                  childEntry.rights.push(right);
                }

                // Continue searching with the same right type
                findChildrenForRight(childId, level + 1, childId);
              }
            });
          };

          // Start from the direct child to find its descendants
          findChildrenForRight(child.group.id, 2, child.group.id);
        });
      });

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [stableRelationships, getDirectRelationships]
  );

  const toggleRight = useCallback((right: string) => {
    setSelectedRights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(right)) {
        newSet.delete(right);
      } else {
        newSet.add(right);
      }
      return newSet;
    });
  }, []);

  const networkData = useMemo(() => {
    if (!groupId) return { parents: [], children: [] };
    
    const { parents, children } = showIndirect
      ? getIndirectRelationships(groupId)
      : getDirectRelationships(groupId);

    // Filter by selected rights
    const filterByRights = (items: typeof parents) => {
       return items.map(item => ({
           ...item,
           rights: item.rights.filter(r => selectedRights.has(r))
       })).filter(item => item.rights.length > 0);
    };

    return {
        parents: filterByRights(parents),
        children: filterByRights(children)
    };
  }, [groupId, showIndirect, getDirectRelationships, getIndirectRelationships, selectedRights]);

  return {
    group,
    isLoading,
    networkData,
    showIndirect,
    setShowIndirect,
    selectedRights,
    toggleRight,
    stableRelationships,
    allRelationships: relationships,
    activeRelationships,
    incomingRequests,
    outgoingRequests
  };
}
