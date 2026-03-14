/**
 * Finds the shortest path through a group network from a user to a target group
 * using Breadth-First Search (BFS) algorithm
 */

export interface GroupNode {
  id: string;
  name: string;
  description?: string;
}

export interface GroupRelationship {
  id: string;
  parentGroup: GroupNode;
  childGroup: GroupNode;
  withRight: string;
}

export interface PathSegment {
  group: GroupNode;
  event?: any;
  relationship?: {
    type: 'parent' | 'child' | 'member';
    right?: string;
  };
  distance: number;
}

/**
 * Find the shortest path from user to target group through the network
 */
export function findShortestPath(
  userGroupIds: string[],
  targetGroupId: string,
  allRelationships: GroupRelationship[],
  groupsData: Map<string, GroupNode>
): PathSegment[] | null {
  // BFS queue: [currentGroupId, path taken so far]
  const queue: [string, PathSegment[]][] = [];
  const visited = new Set<string>();

  // Initialize queue with user's direct groups
  userGroupIds.forEach(groupId => {
    const group = groupsData.get(groupId);
    if (group) {
      queue.push([
        groupId,
        [
          {
            group,
            relationship: { type: 'member' },
            distance: 0,
          },
        ],
      ]);
      visited.add(groupId);
    }
  });

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const [currentGroupId, path] = item;

    // Check if we've reached the target
    if (currentGroupId === targetGroupId) {
      return path;
    }

    const currentDistance = path.length;

    // Find all groups connected to current group
    allRelationships.forEach(rel => {
      let nextGroupId: string | null = null;
      let relType: 'parent' | 'child' | null = null;
      let nextGroup: GroupNode | undefined;

      // Check if current group is the child (meaning we can traverse to parent)
      if (rel.childGroup.id === currentGroupId && !visited.has(rel.parentGroup.id)) {
        nextGroupId = rel.parentGroup.id;
        nextGroup = groupsData.get(nextGroupId);
        relType = 'parent';
      }
      // Check if current group is the parent (meaning we can traverse to child)
      else if (rel.parentGroup.id === currentGroupId && !visited.has(rel.childGroup.id)) {
        nextGroupId = rel.childGroup.id;
        nextGroup = groupsData.get(nextGroupId);
        relType = 'child';
      }

      if (nextGroupId && nextGroup && relType) {
        visited.add(nextGroupId);

        const newPath: PathSegment[] = [
          ...path,
          {
            group: nextGroup,
            relationship: {
              type: relType,
              right: rel.withRight,
            },
            distance: currentDistance,
          },
        ];

        queue.push([nextGroupId, newPath]);
      }
    });
  }

  // No path found
  return null;
}

/**
 * Get all possible paths (not just shortest) - useful for displaying alternatives
 */
export function findAllPaths(
  userGroupIds: string[],
  targetGroupId: string,
  allRelationships: GroupRelationship[],
  groupsData: Map<string, GroupNode>,
  maxDepth = 5
): PathSegment[][] {
  const allPaths: PathSegment[][] = [];

  const dfs = (currentGroupId: string, path: PathSegment[], visited: Set<string>) => {
    // Stop if we've gone too deep
    if (path.length > maxDepth) return;

    // Check if we've reached the target
    if (currentGroupId === targetGroupId) {
      allPaths.push([...path]);
      return;
    }

    // Find all groups connected to current group
    allRelationships.forEach(rel => {
      let nextGroupId: string | null = null;
      let relType: 'parent' | 'child' | null = null;
      let nextGroup: GroupNode | undefined;

      if (rel.childGroup.id === currentGroupId && !visited.has(rel.parentGroup.id)) {
        nextGroupId = rel.parentGroup.id;
        nextGroup = groupsData.get(nextGroupId);
        relType = 'parent';
      } else if (rel.parentGroup.id === currentGroupId && !visited.has(rel.childGroup.id)) {
        nextGroupId = rel.childGroup.id;
        nextGroup = groupsData.get(nextGroupId);
        relType = 'child';
      }

      if (nextGroupId && nextGroup && relType) {
        const newVisited = new Set(visited);
        newVisited.add(nextGroupId);

        const newPath: PathSegment[] = [
          ...path,
          {
            group: nextGroup,
            relationship: {
              type: relType,
              right: rel.withRight,
            },
            distance: path.length,
          },
        ];

        dfs(nextGroupId, newPath, newVisited);
      }
    });
  };

  // Start DFS from each user group
  userGroupIds.forEach(groupId => {
    const group = groupsData.get(groupId);
    if (group) {
      const visited = new Set<string>([groupId]);
      dfs(
        groupId,
        [
          {
            group,
            relationship: { type: 'member' },
            distance: 0,
          },
        ],
        visited
      );
    }
  });

  // Sort by path length (shortest first)
  return allPaths.sort((a, b) => a.length - b.length);
}

/**
 * Convert a path to storage format for the database
 * Returns an array suitable for storing in amendmentPaths.pathData
 */
export function pathToStorageFormat(
  path: PathSegment[],
  events: any[] = []
): {
  groupId: string;
  groupName: string;
  eventId?: string;
  eventTitle?: string;
}[] {
  return path.map(segment => {
    // Find the nearest future event for this group
    const groupEvents = events.filter((e: any) => e.group?.id === segment.group.id);
    const futureEvents = groupEvents.filter((e: any) => new Date(e.startDate) > new Date());
    const nearestEvent = futureEvents.sort(
      (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];

    return {
      groupId: segment.group.id,
      groupName: segment.group.name,
      eventId: nearestEvent?.id,
      eventTitle: nearestEvent?.title,
    };
  });
}
