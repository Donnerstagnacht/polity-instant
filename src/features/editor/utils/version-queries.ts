/**
 * Version Queries Utility
 *
 * Factory functions for building entity-specific version queries.
 * Abstracts the differences between document and blog version queries.
 */

import type { EditorEntityType } from '../types';

/**
 * Build the where clause for querying versions of an entity
 *
 * @param entityType - The type of entity
 * @param entityId - The entity ID
 * @returns The where clause for InstantDB query
 */
export function buildVersionWhereClause(
  entityType: EditorEntityType,
  entityId: string
): Record<string, string> {
  switch (entityType) {
    case 'blog':
      return { 'blog.id': entityId };
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return { 'document.id': entityId };
  }
}

/**
 * Build the link object for creating a new version
 *
 * @param entityType - The type of entity
 * @param entityId - The entity ID
 * @returns The link name for the version
 */
export function getVersionLinkName(entityType: EditorEntityType): 'blog' | 'document' {
  switch (entityType) {
    case 'blog':
      return 'blog';
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return 'document';
  }
}

/**
 * Get the entity field name used in the version record
 *
 * @param entityType - The type of entity
 * @returns The field name
 */
export function getVersionEntityField(entityType: EditorEntityType): string {
  switch (entityType) {
    case 'blog':
      return 'blogId';
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return 'documentId';
  }
}

/**
 * Build the InstantDB query for fetching versions
 *
 * @param entityType - The type of entity
 * @param entityId - The entity ID
 * @returns Query object for db.useQuery
 */
export function buildVersionsQuery(entityType: EditorEntityType, entityId: string) {
  const whereClause = buildVersionWhereClause(entityType, entityId);

  return {
    documentVersions: {
      $: {
        where: whereClause,
      },
      creator: {},
    },
  };
}

/**
 * Get the maximum version number from a list of versions
 *
 * @param versions - Array of version objects with versionNumber
 * @returns The highest version number, or 0 if no versions
 */
export function getMaxVersionNumber(versions: { versionNumber: number }[]): number {
  if (versions.length === 0) return 0;
  return Math.max(...versions.map(v => v.versionNumber));
}

/**
 * Sort versions by version number (newest first)
 *
 * @param versions - Array of version objects with versionNumber
 * @returns Sorted array (does not mutate original)
 */
export function sortVersionsDescending<T extends { versionNumber: number }>(versions: T[]): T[] {
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
}

/**
 * Filter versions by search query
 *
 * @param versions - Array of version objects
 * @param query - Search query string
 * @returns Filtered versions matching the query
 */
export function filterVersions<
  T extends { title: string; versionNumber: number; creator?: { name?: string } },
>(versions: T[], query: string): T[] {
  if (!query.trim()) return versions;

  const lowerQuery = query.toLowerCase();
  return versions.filter(
    version =>
      version.title.toLowerCase().includes(lowerQuery) ||
      version.versionNumber.toString().includes(lowerQuery) ||
      version.creator?.name?.toLowerCase().includes(lowerQuery)
  );
}
