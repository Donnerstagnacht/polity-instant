export interface SubgroupDistribution {
  id: string;
  name: string;
  memberCount: number;
}

export interface HierarchicalGroupStats {
  totalMembers: number;
  directSubgroupCount: number;
  totalSubgroupCount: number;
  memberDistribution: SubgroupDistribution[];
}

/**
 * Compute aggregate stats for a hierarchical group from its child relationships.
 *
 * @param groupId - The hierarchical group to compute stats for
 * @param relationships - All group_relationship rows (need group_id, related_group_id, direction, rights)
 * @param groups - Lookup of group info (id → name, member_count)
 */
export function computeHierarchicalGroupStats(
  groupId: string,
  relationships: Array<{
    group_id: string;
    related_group_id: string;
    direction: string;
    rights: string[] | string | null;
  }>,
  groups: Array<{ id: string; name: string | null; member_count: number | null }>
): HierarchicalGroupStats {
  const groupMap = new Map(groups.map(g => [g.id, g]));

  // Find all PVR child group IDs (direct children)
  const directChildIds = new Set<string>();
  for (const rel of relationships) {
    const isPvr =
      Array.isArray(rel.rights)
        ? rel.rights.includes('passive_voting_right')
        : typeof rel.rights === 'string' && rel.rights.includes('passive_voting_right');
    if (!isPvr) continue;

    if (rel.group_id === groupId && rel.direction === 'parent_to_child') {
      directChildIds.add(rel.related_group_id);
    } else if (rel.related_group_id === groupId && rel.direction === 'child_to_parent') {
      directChildIds.add(rel.group_id);
    }
  }

  // BFS to find all descendant groups (including nested hierarchical subgroups)
  const allDescendantIds = new Set<string>();
  const queue = [...directChildIds];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (allDescendantIds.has(current)) continue;
    allDescendantIds.add(current);

    for (const rel of relationships) {
      const isPvr =
        Array.isArray(rel.rights)
          ? rel.rights.includes('passive_voting_right')
          : typeof rel.rights === 'string' && rel.rights.includes('passive_voting_right');
      if (!isPvr) continue;

      if (rel.group_id === current && rel.direction === 'parent_to_child') {
        if (!allDescendantIds.has(rel.related_group_id)) queue.push(rel.related_group_id);
      } else if (rel.related_group_id === current && rel.direction === 'child_to_parent') {
        if (!allDescendantIds.has(rel.group_id)) queue.push(rel.group_id);
      }
    }
  }

  // Build distribution from direct children (member_count already materialized)
  const memberDistribution: SubgroupDistribution[] = [];
  let totalMembers = 0;

  for (const childId of directChildIds) {
    const group = groupMap.get(childId);
    const count = group?.member_count ?? 0;
    memberDistribution.push({
      id: childId,
      name: group?.name ?? 'Unknown',
      memberCount: count,
    });
    totalMembers += count;
  }

  return {
    totalMembers,
    directSubgroupCount: directChildIds.size,
    totalSubgroupCount: allDescendantIds.size,
    memberDistribution,
  };
}
