import type { GroupNetworkRelationshipRow } from '@/zero/groups/queries';

export type NetworkTab = 'current-network' | 'manage-network';

export type NormalizedGroupRelationship = GroupNetworkRelationshipRow;

export type NetworkGroupEntity = NonNullable<GroupNetworkRelationshipRow['group']>;

export function normalizeGroupRelationship(rel: NormalizedGroupRelationship): NormalizedGroupRelationship {
	return rel;
}

export interface EnrichedPathSegment {
	groupId: string | null;
	groupName: string;
	eventId: string | null;
	eventTitle: string;
	eventStartDate: number | null;
	agendaItemId: string | null;
	amendmentVoteId: string | null;
	forwardingStatus: string | null;
	order: number | null;
}
