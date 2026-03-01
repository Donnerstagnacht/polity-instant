/**
 * Pure functions for hierarchical group membership.
 *
 * Operates on plain arrays of group-relationships and group-memberships,
 * so every function is easy to unit-test without a database.
 */

// ── Types (minimal shapes expected from Zero query results) ─────────

export interface GroupRelationshipRow {
  id: string
  group_id: string         // parent group
  related_group_id: string // child group
  with_right: string | null
  status: string | null
}

export interface GroupMembershipRow {
  id: string
  group_id: string
  user_id: string
  source: string           // 'direct' | 'derived'
  source_group_id: string | null
  status: string | null
}

export interface GroupRow {
  id: string
  group_type: string       // 'base' | 'hierarchical'
}

// ── Traversal helpers ───────────────────────────────────────────────

/**
 * Resolve all hierarchical ancestor group IDs reachable from `baseGroupId`
 * by walking **upward** through `passiveVotingRight` links.
 *
 * Returns the IDs in bottom-up order (nearest parent first).
 */
export function resolveHierarchicalAncestors(
  baseGroupId: string,
  relationships: GroupRelationshipRow[],
): string[] {
  const pvr = relationships.filter(
    r => r.with_right === 'passiveVotingRight' && r.status === 'active',
  )

  const ancestors: string[] = []
  const visited = new Set<string>()
  const queue = [baseGroupId]

  while (queue.length > 0) {
    const current = queue.shift()!
    // Find parents of `current` (current is the child → related_group_id)
    for (const rel of pvr) {
      if (rel.related_group_id === current && !visited.has(rel.group_id)) {
        visited.add(rel.group_id)
        ancestors.push(rel.group_id)
        queue.push(rel.group_id)
      }
    }
  }

  return ancestors
}

/**
 * Resolve all **base-group member user IDs** reachable from a hierarchical
 * group by walking **downward** through `passiveVotingRight` links.
 *
 * Only returns users with `source === 'direct'` in the leaf base groups.
 */
export function resolveBaseGroupMembers(
  hierarchicalGroupId: string,
  relationships: GroupRelationshipRow[],
  memberships: GroupMembershipRow[],
): string[] {
  const pvr = relationships.filter(
    r => r.with_right === 'passiveVotingRight' && r.status === 'active',
  )

  // Collect all descendant base groups
  const baseGroupIds = new Set<string>()
  const visited = new Set<string>()
  const queue = [hierarchicalGroupId]

  while (queue.length > 0) {
    const current = queue.shift()!
    // Find children of `current` (current is the parent → group_id)
    for (const rel of pvr) {
      if (rel.group_id === current && !visited.has(rel.related_group_id)) {
        visited.add(rel.related_group_id)
        // Check if the child has children of its own
        const hasChildren = pvr.some(r => r.group_id === rel.related_group_id)
        if (hasChildren) {
          queue.push(rel.related_group_id) // intermediate hierarchical group
        } else {
          baseGroupIds.add(rel.related_group_id) // leaf = base group
        }
      }
    }
  }

  // Collect unique user IDs from those base groups (direct memberships only)
  const userIds = new Set<string>()
  for (const m of memberships) {
    if (baseGroupIds.has(m.group_id) && m.source === 'direct') {
      userIds.add(m.user_id)
    }
  }

  return [...userIds]
}

/**
 * Check the exclusivity constraint: a user must NOT be a direct member of
 * another base group that shares a hierarchical ancestor with `targetBaseGroupId`.
 *
 * Returns `true` when the user **can** safely join (no conflict).
 */
export function checkExclusivityConstraint(
  userId: string,
  targetBaseGroupId: string,
  relationships: GroupRelationshipRow[],
  memberships: GroupMembershipRow[],
): boolean {
  // 1. Find all hierarchical ancestors of the target base group
  const ancestors = resolveHierarchicalAncestors(targetBaseGroupId, relationships)

  if (ancestors.length === 0) {
    // No hierarchy → no constraint to enforce
    return true
  }

  // 2. For each ancestor, find all child base groups (excluding the target)
  const siblingBaseGroups = new Set<string>()
  for (const ancestorId of ancestors) {
    const children = resolveChildBaseGroups(ancestorId, relationships)
    for (const childId of children) {
      if (childId !== targetBaseGroupId) {
        siblingBaseGroups.add(childId)
      }
    }
  }

  // 3. Check if the user is a direct member of any sibling base group
  for (const m of memberships) {
    if (
      m.user_id === userId &&
      m.source === 'direct' &&
      siblingBaseGroups.has(m.group_id)
    ) {
      return false // Conflict: user already in a sibling base group
    }
  }

  return true
}

/**
 * Find all base (leaf) groups below a given group in the passive-voting-right tree.
 */
export function resolveChildBaseGroups(
  groupId: string,
  relationships: GroupRelationshipRow[],
): string[] {
  const pvr = relationships.filter(
    r => r.with_right === 'passiveVotingRight' && r.status === 'active',
  )

  const baseGroups: string[] = []
  const visited = new Set<string>()
  const queue = [groupId]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const rel of pvr) {
      if (rel.group_id === current && !visited.has(rel.related_group_id)) {
        visited.add(rel.related_group_id)
        const hasChildren = pvr.some(r => r.group_id === rel.related_group_id)
        if (hasChildren) {
          queue.push(rel.related_group_id)
        } else {
          baseGroups.push(rel.related_group_id)
        }
      }
    }
  }

  return baseGroups
}

/**
 * Detect member-overlap conflicts that would arise from linking `childGroupId`
 * under `parentGroupId` with passiveVotingRight.
 *
 * Returns list of user IDs that appear in both the new child and an existing
 * sibling base group under the same hierarchy.
 */
export function detectLinkConflicts(
  parentGroupId: string,
  childGroupId: string,
  relationships: GroupRelationshipRow[],
  memberships: GroupMembershipRow[],
): string[] {
  // Find existing child base groups under the parent (before the new link)
  const existingBaseGroups = resolveChildBaseGroups(parentGroupId, relationships)

  // Members of existing base groups
  const existingUserIds = new Set<string>()
  for (const m of memberships) {
    if (existingBaseGroups.includes(m.group_id) && m.source === 'direct') {
      existingUserIds.add(m.user_id)
    }
  }

  // Members of the new child (could itself be a base group or contain base groups)
  const newBaseGroups = [childGroupId, ...resolveChildBaseGroups(childGroupId, relationships)]
  const newUserIds = new Set<string>()
  for (const m of memberships) {
    if (newBaseGroups.includes(m.group_id) && m.source === 'direct') {
      newUserIds.add(m.user_id)
    }
  }

  // Intersection = conflicts
  return [...newUserIds].filter(uid => existingUserIds.has(uid))
}
