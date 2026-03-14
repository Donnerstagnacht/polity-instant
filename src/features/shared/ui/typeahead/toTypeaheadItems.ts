import type { TypeaheadItem, EntityType } from '@/features/shared/logic/typeaheadHelpers';

/**
 * Convert a raw data array into TypeaheadItem[] for use with the TypeaheadSearch `items` prop.
 */
export function toTypeaheadItems<T extends { id: string }>(
  items: T[],
  entityType: EntityType,
  getLabel: (item: T) => string,
  getSecondaryLabel?: (item: T) => string | null | undefined,
  getAvatar?: (item: T) => string | null | undefined
): TypeaheadItem[] {
  return items.map(item => ({
    id: item.id,
    entityType,
    label: getLabel(item),
    secondaryLabel: getSecondaryLabel?.(item) ?? undefined,
    avatar: getAvatar?.(item) ?? null,
  }));
}
