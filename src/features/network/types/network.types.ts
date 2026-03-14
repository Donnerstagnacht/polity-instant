import type { GroupNetworkRelationshipRow } from '@/zero/groups/queries';

export type NetworkTab = 'current-network' | 'manage-network';

export type NormalizedGroupRelationship = GroupNetworkRelationshipRow;

export type NetworkGroupEntity = NonNullable<GroupNetworkRelationshipRow['group']>;

export function normalizeGroupRelationship(rel: NormalizedGroupRelationship): NormalizedGroupRelationship {
	return rel;
}
