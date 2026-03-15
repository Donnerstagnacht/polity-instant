import { findShortestPath, type GroupNode, type GroupRelationship, type PathSegment } from './path-finding';
import type {
  NetworkGroupRow,
  NetworkGroupRelationshipRow,
  NetworkGroupMembershipRow,
  NetworkEventRow,
} from '@/zero/amendments/queries';

export type { NetworkGroupRow as AmendmentNetworkGroup };
export type { NetworkGroupRelationshipRow as AmendmentNetworkRelationship };
export type { NetworkGroupMembershipRow as AmendmentNetworkMembership };
export type { NetworkEventRow as AmendmentNetworkEvent };

export interface PathWithEventSegment {
  groupId: string;
  groupName: string;
  eventId: string | null;
  eventTitle: string;
  eventStartDate: number | null;
}

interface BuildPathInput {
  userGroupIds: string[];
  targetGroupId: string;
  groups: NetworkGroupRow[];
  relationships: NetworkGroupRelationshipRow[];
  events: NetworkEventRow[];
}

const AMENDMENT_RIGHT = 'amendmentRight';

export function getActiveUserGroupIds(
  memberships: NetworkGroupMembershipRow[],
  userId: string
): string[] {
  return memberships
    .filter((membership) => {
      const isActive = membership.status === 'active' || membership.status === 'admin';
      return isActive && membership.user?.id === userId;
    })
    .map((membership) => membership.group?.id)
    .filter((groupId): groupId is string => Boolean(groupId));
}

function toPathRelationships(
  relationships: NetworkGroupRelationshipRow[]
): GroupRelationship[] {
  return relationships
    .filter((relationship) => relationship.with_right === AMENDMENT_RIGHT)
    .filter((relationship) => relationship.group?.id && relationship.related_group?.id)
    .map((relationship) => ({
      id: relationship.id,
      parentGroup: {
        id: relationship.group?.id ?? '',
        name: relationship.group?.name ?? '',
      },
      childGroup: {
        id: relationship.related_group?.id ?? '',
        name: relationship.related_group?.name ?? '',
      },
      withRight: relationship.with_right ?? '',
    }));
}

function toGroupsMap(groups: NetworkGroupRow[]): Map<string, GroupNode> {
  return new Map(
    groups.map((group) => [
      group.id,
      {
        id: group.id,
        name: group.name ?? '',
        description: group.description ?? undefined,
      },
    ])
  );
}

function isUpwardPath(path: PathSegment[]): boolean {
  return path.every((segment, index) => index === 0 || segment.relationship?.type !== 'child');
}

function getClosestUpcomingEventForGroup(
  groupId: string,
  events: NetworkEventRow[]
): NetworkEventRow | undefined {
  const now = Date.now();
  return events
    .filter((event) => event.group?.id === groupId && (event.start_date ?? 0) > now)
    .sort((a, b) => (a.start_date ?? 0) - (b.start_date ?? 0))[0];
}

export function calculateUpwardPathWithClosestEvents({
  userGroupIds,
  targetGroupId,
  groups,
  relationships,
  events,
}: BuildPathInput): PathWithEventSegment[] | null {
  if (userGroupIds.length === 0) return null;

  const path = findShortestPath(
    userGroupIds,
    targetGroupId,
    toPathRelationships(relationships),
    toGroupsMap(groups)
  );

  if (!path || !isUpwardPath(path)) return null;

  return path.map((segment) => {
    const closestEvent = getClosestUpcomingEventForGroup(segment.group.id, events);

    return {
      groupId: segment.group.id,
      groupName: segment.group.name,
      eventId: closestEvent?.id ?? null,
      eventTitle: closestEvent?.title ?? 'No upcoming event',
      eventStartDate: closestEvent?.start_date ?? null,
    };
  });
}

export function getUpwardConnectedGroupsForUser(
  userGroupIds: string[],
  groups: NetworkGroupRow[],
  relationships: NetworkGroupRelationshipRow[]
): NetworkGroupRow[] {
  if (userGroupIds.length === 0) return [];

  return groups.filter((group) =>
    calculateUpwardPathWithClosestEvents({
      userGroupIds,
      targetGroupId: group.id,
      groups,
      relationships,
      events: [],
    }) !== null
  );
}
