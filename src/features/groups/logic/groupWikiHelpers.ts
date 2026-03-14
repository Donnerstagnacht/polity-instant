/**
 * Pure helper functions for the GroupWiki page.
 * Extracted from GroupWiki.tsx so they can be tested independently
 * and reused across components without a React dependency.
 */

/** Translate a group right code to a German display label */
export function formatRight(right: string): string {
  const labels: Record<string, string> = {
    informationRight: 'Informationsrecht',
    amendmentRight: 'Antragsrecht',
    rightToSpeak: 'Rederecht',
    activeVotingRight: 'Aktives Stimmrecht',
    passiveVotingRight: 'Passives Stimmrecht',
  };
  return labels[right] || right.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Group an array of relationship objects by their target group,
 * collecting the associated rights into a single entry per group.
 *
 * @param relationships - Raw relationship rows (with `.group` and `.related_group` relations)
 * @param type - Whether to pick the parent (`rel.group`) or child (`rel.related_group`) side
 * @returns Deduplicated array of `{ group, rights }` entries
 */
interface RelationshipRow {
  group?: { id: string; name?: string | null; description?: string | null; member_count?: number; memberships?: readonly unknown[]; amendments?: readonly unknown[]; events?: readonly unknown[]; [key: string]: unknown };
  related_group?: { id: string; name?: string | null; description?: string | null; member_count?: number; memberships?: readonly unknown[]; amendments?: readonly unknown[]; events?: readonly unknown[]; [key: string]: unknown };
  with_right: string | null;
}

type GroupEntry = RelationshipRow['group'] & {};

export function groupRelationshipsByGroup(
  relationships: RelationshipRow[],
  type: 'parent' | 'child'
): { group: GroupEntry; rights: string[] }[] {
  const grouped = new Map<string, { group: GroupEntry; rights: string[] }>();

  relationships?.forEach((rel) => {
    const targetGroup = type === 'parent' ? rel.group : rel.related_group;
    if (!targetGroup) return;

    if (!grouped.has(targetGroup.id)) {
      grouped.set(targetGroup.id, { group: targetGroup, rights: [] });
    }
    const entry = grouped.get(targetGroup.id);
    if (entry && rel.with_right) {
      entry.rights.push(rel.with_right);
    }
  });

  return Array.from(grouped.values());
}
