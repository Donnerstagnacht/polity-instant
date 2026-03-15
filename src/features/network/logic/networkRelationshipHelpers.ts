import type { NormalizedGroupRelationship, NetworkGroupEntity } from '../types/network.types';

export interface RelationshipEntry {
  group: NetworkGroupEntity;
  rights: string[];
  level?: number;
  childId?: string;
  parentId?: string;
}

export interface RelationshipResult {
  parents: RelationshipEntry[];
  children: RelationshipEntry[];
}

/**
 * Build direct (one-level) parent/child relationships for a target group.
 */
export function buildDirectRelationships(
  relationships: NormalizedGroupRelationship[],
  targetGroupId: string,
  filterRight?: string,
): RelationshipResult {
  const parentsMap = new Map<string, RelationshipEntry>();
  const childrenMap = new Map<string, RelationshipEntry>();

  relationships.forEach((rel) => {
    if (filterRight && (rel.with_right ?? '') !== filterRight) {
      return;
    }

    if (rel.related_group?.id === targetGroupId && rel.group) {
      const parentId = rel.group.id;
      if (!parentsMap.has(parentId)) {
        parentsMap.set(parentId, { group: rel.group, rights: [] });
      }
      parentsMap.get(parentId)!.rights.push(rel.with_right ?? '');
    }

    if (rel.group?.id === targetGroupId && rel.related_group) {
      const childId = rel.related_group.id;
      if (!childrenMap.has(childId)) {
        childrenMap.set(childId, { group: rel.related_group, rights: [] });
      }
      childrenMap.get(childId)!.rights.push(rel.with_right ?? '');
    }
  });

  return {
    parents: Array.from(parentsMap.values()),
    children: Array.from(childrenMap.values()),
  };
}

/**
 * Build indirect (recursive, per-right-type chain) parent/child relationships for a target group.
 */
export function buildIndirectRelationships(
  relationships: NormalizedGroupRelationship[],
  targetGroupId: string,
  filterRight?: string,
): RelationshipResult {
  const parentsMap = new Map<string, RelationshipEntry>();
  const childrenMap = new Map<string, RelationshipEntry>();

  const directRels = buildDirectRelationships(relationships, targetGroupId, filterRight);

  // For parents: Add direct parents first (level 1), then follow chains for each right type
  directRels.parents.forEach(parent => {
    parentsMap.set(parent.group.id, {
      group: parent.group,
      rights: [...parent.rights],
      level: 1,
      childId: targetGroupId,
    });

    parent.rights.forEach(right => {
      const visited = new Set<string>([targetGroupId, parent.group.id]);

      const findParentsForRight = (id: string, level: number) => {
        relationships.forEach((rel) => {
          if (filterRight && (rel.with_right ?? '') !== filterRight) return;
          if (
            rel.related_group?.id === id &&
            (rel.with_right ?? '') === right &&
            rel.group?.id &&
            !visited.has(rel.group.id)
          ) {
            const parentId = rel.group.id;
            visited.add(parentId);

            if (!parentsMap.has(parentId)) {
              parentsMap.set(parentId, {
                group: rel.group,
                rights: [],
                level,
                childId: id,
              });
            }
            const entry = parentsMap.get(parentId)!;
            if (!entry.rights.includes(right)) {
              entry.rights.push(right);
            }

            findParentsForRight(parentId, level + 1);
          }
        });
      };

      findParentsForRight(parent.group.id, 2);
    });
  });

  // For children: Add direct children first (level 1), then follow chains for each right type
  directRels.children.forEach(child => {
    childrenMap.set(child.group.id, {
      group: child.group,
      rights: [...child.rights],
      level: 1,
      parentId: targetGroupId,
    });

    child.rights.forEach(right => {
      const visited = new Set<string>([targetGroupId, child.group.id]);

      const findChildrenForRight = (id: string, level: number, currentParentId: string) => {
        relationships.forEach((rel) => {
          if (filterRight && (rel.with_right ?? '') !== filterRight) return;
          if (
            rel.group?.id === id &&
            (rel.with_right ?? '') === right &&
            rel.related_group?.id &&
            !visited.has(rel.related_group.id)
          ) {
            const childId = rel.related_group.id;
            visited.add(childId);

            if (!childrenMap.has(childId)) {
              childrenMap.set(childId, {
                group: rel.related_group,
                rights: [],
                level,
                parentId: currentParentId,
              });
            }
            const entry = childrenMap.get(childId)!;
            if (!entry.rights.includes(right)) {
              entry.rights.push(right);
            }

            findChildrenForRight(childId, level + 1, childId);
          }
        });
      };

      findChildrenForRight(child.group.id, 2, child.group.id);
    });
  });

  return {
    parents: Array.from(parentsMap.values()),
    children: Array.from(childrenMap.values()),
  };
}
