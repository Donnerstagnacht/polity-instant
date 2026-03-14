export type NetworkTab = 'current-network' | 'manage-network';

export interface NetworkGroupEntity {
	id: string;
	name?: string | null;
	description?: string | null;
	group_type?: string | null;
	[key: string]: string | number | boolean | null | undefined;
}

export interface NormalizedGroupRelationship {
	id: string;
	group_id: string;
	related_group_id: string;
	status?: string | null;
	with_right?: string | null;
	relationship_type?: string | null;
	initiator_group_id?: string | null;
	created_at?: number;
	group?: NetworkGroupEntity;
	related_group?: NetworkGroupEntity;
	parentGroup?: NetworkGroupEntity;
	childGroup?: NetworkGroupEntity;
	withRight: string;
	relationshipType: string;
	initiatorGroupId?: string;
}

export function normalizeGroupRelationship(rel: {
	id: string;
	group_id: string;
	related_group_id: string;
	relationship_type?: string | null;
	with_right?: string | null;
	status?: string | null;
	initiator_group_id?: string | null;
	created_at?: number;
	group?: NetworkGroupEntity | null;
	related_group?: NetworkGroupEntity | null;
	parentGroup?: NetworkGroupEntity;
	childGroup?: NetworkGroupEntity;
	withRight?: string;
	relationshipType?: string;
	initiatorGroupId?: string;
}): NormalizedGroupRelationship {
	const parentGroup = rel.parentGroup ?? (rel.group as NetworkGroupEntity | undefined);
	const childGroup = rel.childGroup ?? (rel.related_group as NetworkGroupEntity | undefined);
	const withRight = rel.withRight ?? rel.with_right ?? '';
	const relationshipType = rel.relationshipType ?? rel.relationship_type ?? '';
	const initiatorGroupId = rel.initiatorGroupId ?? rel.initiator_group_id ?? undefined;

	return {
		...rel,
		group_id: rel.group_id ?? parentGroup?.id ?? '',
		related_group_id: rel.related_group_id ?? childGroup?.id ?? '',
		with_right: rel.with_right ?? withRight,
		relationship_type: rel.relationship_type ?? relationshipType,
		initiator_group_id: rel.initiator_group_id ?? initiatorGroupId ?? null,
		group: rel.group ?? parentGroup,
		related_group: rel.related_group ?? childGroup,
		parentGroup,
		childGroup,
		withRight,
		relationshipType,
		initiatorGroupId,
	};
}
