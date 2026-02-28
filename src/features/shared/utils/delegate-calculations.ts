/**
 * Utility functions for delegate conference calculations
 * Handles proportional delegate allocation based on subgroup member counts
 */

export interface SubgroupInfo {
  id: string;
  name: string;
  memberCount: number;
  allocatedDelegates: number;
}

export interface DelegateAllocation {
  groupId: string;
  allocatedDelegates: number;
  memberCount: number;
}

/**
 * Calculate proportional delegate allocation for subgroups
 * Uses largest remainder method (Hare quota) to ensure fair distribution
 * 
 * @param subgroups - Array of subgroups with member counts
 * @param totalDelegates - Total number of delegates to allocate
 * @returns Array of delegate allocations per group
 */
export function calculateDelegateAllocations(
  subgroups: Array<{ id: string; memberCount: number }>,
  totalDelegates: number
): DelegateAllocation[] {
  // Filter out groups with no members
  const validGroups = subgroups.filter(g => g.memberCount > 0);
  
  if (validGroups.length === 0) {
    return [];
  }

  const totalMembers = validGroups.reduce((sum, g) => sum + g.memberCount, 0);
  
  if (totalMembers === 0) {
    return validGroups.map(g => ({
      groupId: g.id,
      allocatedDelegates: 0,
      memberCount: g.memberCount,
    }));
  }

  // Calculate quota (members per delegate)
  const quota = totalMembers / totalDelegates;

  // Step 1: Allocate based on full quotas
  const allocations = validGroups.map(group => {
    const exactShare = group.memberCount / quota;
    const fullDelegates = Math.floor(exactShare);
    const remainder = exactShare - fullDelegates;

    return {
      groupId: group.id,
      memberCount: group.memberCount,
      allocatedDelegates: fullDelegates,
      remainder,
    };
  });

  // Step 2: Distribute remaining delegates by largest remainder
  let allocatedTotal = allocations.reduce((sum, a) => sum + a.allocatedDelegates, 0);
  const remainingDelegates = totalDelegates - allocatedTotal;

  if (remainingDelegates > 0) {
    // Sort by remainder (descending)
    const sorted = [...allocations].sort((a, b) => b.remainder - a.remainder);
    
    // Allocate remaining delegates to groups with largest remainders
    for (let i = 0; i < remainingDelegates && i < sorted.length; i++) {
      const group = sorted[i];
      const original = allocations.find(a => a.groupId === group.groupId);
      if (original) {
        original.allocatedDelegates += 1;
      }
    }
  }

  // Return final allocations (without remainder field)
  return allocations.map(({ groupId, memberCount, allocatedDelegates }) => ({
    groupId,
    memberCount,
    allocatedDelegates,
  }));
}

/**
 * Get direct subgroups (1 level deep) for a parent group
 * Uses the groupRelationships entity to find child groups
 * 
 * @param parentGroupId - ID of the parent group
 * @param groupRelationships - Array of group relationships from DB
 * @param groups - Array of all groups with member counts
 * @returns Array of direct subgroups with their info
 */
export function getDirectSubgroups(
  parentGroupId: string,
  groupRelationships: Array<{
    id: string;
    childGroup: { id: string; name: string; memberCount: number };
    parentGroup: { id: string };
  }>
): SubgroupInfo[] {
  // Find all relationships where this group is the parent
  const childRelationships = groupRelationships.filter(
    rel => rel.parentGroup.id === parentGroupId
  );

  // Map to subgroup info
  return childRelationships.map(rel => ({
    id: rel.childGroup.id,
    name: rel.childGroup.name,
    memberCount: rel.childGroup.memberCount,
    allocatedDelegates: 0, // Will be calculated separately
  }));
}

/**
 * Finalize delegates for an event by selecting top N from each group's nomination list
 * 
 * @param nominations - Array of nominated delegates with priority order
 * @param allocations - Current delegate allocations per group
 * @returns Array of delegate IDs to confirm with their new status
 */
export function finalizeDelegateSelection(
  nominations: Array<{
    id: string;
    groupId: string;
    userId: string;
    priority: number;
    status: string;
  }>,
  allocations: DelegateAllocation[]
): Array<{ id: string; status: 'confirmed' | 'standby' }> {
  const results: Array<{ id: string; status: 'confirmed' | 'standby' }> = [];

  // Process each group
  allocations.forEach(allocation => {
    // Get nominations for this group, sorted by priority
    const groupNominations = nominations
      .filter(n => n.groupId === allocation.groupId && n.status === 'nominated')
      .sort((a, b) => a.priority - b.priority);

    // Confirm first X delegates based on allocation
    groupNominations.forEach((nomination, index) => {
      if (index < allocation.allocatedDelegates) {
        results.push({ id: nomination.id, status: 'confirmed' });
      } else {
        results.push({ id: nomination.id, status: 'standby' });
      }
    });
  });

  return results;
}

/**
 * Calculate total delegates based on a ratio
 * For example: 1 delegate per 50 members
 * 
 * @param totalMembers - Total members across all subgroups
 * @param ratio - Members per delegate (default: 50)
 * @returns Total number of delegates to allocate
 */
export function calculateTotalDelegates(
  totalMembers: number,
  ratio: number = 50
): number {
  if (totalMembers === 0) return 0;
  return Math.max(1, Math.floor(totalMembers / ratio));
}

/**
 * Validate that a group is eligible for a delegate conference
 * Must have at least one subgroup
 * 
 * @param groupId - ID of the group to check
 * @param groupRelationships - Array of group relationships
 * @returns Boolean indicating eligibility
 */
export function isEligibleForDelegateConference(
  groupId: string,
  groupRelationships: Array<{ parentGroup: { id: string } }>
): boolean {
  return groupRelationships.some(rel => rel.parentGroup.id === groupId);
}
