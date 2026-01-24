/**
 * Unified Version Utilities
 *
 * Handles version creation and management for all entity types.
 */

import { db, tx, id } from '@db/db';
import type { EditorEntityType, VersionCreationType } from '../types';

interface CreateVersionParams {
  entityType: EditorEntityType;
  entityId: string;
  userId: string;
  content: any[];
  creationType: VersionCreationType;
  title?: string;
}

/**
 * Creates a new version of an entity's content
 * Automatically generates version number and title based on type
 */
export async function createVersion({
  entityType,
  entityId,
  userId,
  content,
  creationType,
  title,
}: CreateVersionParams): Promise<void> {
  // Build the where clause based on entity type
  const whereClause = getVersionWhereClause(entityType, entityId);

  const { data: versionsData } = await db.queryOnce({
    documentVersions: {
      $: {
        where: whereClause,
      },
    },
  });

  const versions = versionsData?.documentVersions || [];
  const nextVersionNumber =
    versions.length > 0 ? Math.max(...versions.map((v: any) => v.versionNumber)) + 1 : 1;

  const versionTitle = title || getDefaultVersionTitle(creationType);

  const versionId = id();
  const linkData = getVersionLink(entityType, entityId);

  await db.transact([
    tx.documentVersions[versionId]
      .update({
        versionNumber: nextVersionNumber,
        title: versionTitle,
        content: content,
        createdAt: Date.now(),
        creationType,
      })
      .link({ ...linkData, creator: userId }),
  ]);
}

/**
 * Gets the appropriate where clause for querying versions
 */
function getVersionWhereClause(entityType: EditorEntityType, entityId: string): any {
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
 * Gets the appropriate link for creating a version
 */
function getVersionLink(entityType: EditorEntityType, entityId: string): Record<string, string> {
  switch (entityType) {
    case 'blog':
      return { blog: entityId };
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return { document: entityId };
  }
}

/**
 * Generates a default title based on the creation type
 */
function getDefaultVersionTitle(creationType: VersionCreationType): string {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  switch (creationType) {
    case 'manual':
      return `Manual save - ${timestamp}`;
    case 'suggestion_added':
      return `Suggestion added - ${timestamp}`;
    case 'suggestion_accepted':
      return `Suggestion accepted - ${timestamp}`;
    case 'suggestion_declined':
      return `Suggestion declined - ${timestamp}`;
    default:
      return `Auto-save - ${timestamp}`;
  }
}

/**
 * Get the latest version number for an entity
 */
export async function getLatestVersionNumber(
  entityType: EditorEntityType,
  entityId: string
): Promise<number> {
  try {
    const whereClause = getVersionWhereClause(entityType, entityId);

    const { data: versionsData } = await db.queryOnce({
      documentVersions: {
        $: {
          where: whereClause,
        },
      },
    });

    const versions = versionsData?.documentVersions || [];
    if (versions.length === 0) return 0;

    return Math.max(...versions.map((v: any) => v.versionNumber));
  } catch (error) {
    console.error('Failed to get latest version number:', error);
    return 0;
  }
}

/**
 * Restore a version (update entity content)
 */
export async function restoreVersion(
  entityType: EditorEntityType,
  entityId: string,
  content: any[]
): Promise<void> {
  const now = Date.now();

  switch (entityType) {
    case 'blog':
      await db.transact([
        tx.blogs[entityId].merge({
          content,
          updatedAt: now,
        }),
      ]);
      break;
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      await db.transact([
        tx.documents[entityId].merge({
          content,
          updatedAt: now,
        }),
      ]);
      break;
  }
}

/**
 * Update entity content (for auto-save)
 */
export async function updateEntityContent(
  entityType: EditorEntityType,
  entityId: string,
  content: any[]
): Promise<void> {
  const now = Date.now();

  switch (entityType) {
    case 'blog':
      await db.transact([
        tx.blogs[entityId].merge({
          content,
          updatedAt: now,
        }),
      ]);
      break;
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      await db.transact([
        tx.documents[entityId].merge({
          content,
          updatedAt: now,
        }),
      ]);
      break;
  }
}

/**
 * Update entity title
 */
export async function updateEntityTitle(
  entityType: EditorEntityType,
  entityId: string,
  title: string
): Promise<void> {
  const now = Date.now();

  switch (entityType) {
    case 'blog':
      await db.transact([
        tx.blogs[entityId].merge({
          title,
          updatedAt: now,
        }),
      ]);
      break;
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      await db.transact([
        tx.documents[entityId].merge({
          title,
          updatedAt: now,
        }),
      ]);
      break;
  }
}

/**
 * Update entity discussions
 */
export async function updateEntityDiscussions(
  entityType: EditorEntityType,
  entityId: string,
  discussions: any[]
): Promise<void> {
  const now = Date.now();

  switch (entityType) {
    case 'blog':
      await db.transact([
        tx.blogs[entityId].merge({
          discussions,
          updatedAt: now,
        }),
      ]);
      break;
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      await db.transact([
        tx.documents[entityId].merge({
          discussions,
          updatedAt: now,
        }),
      ]);
      break;
  }
}

/**
 * Update entity editing mode
 */
export async function updateEntityMode(
  entityType: EditorEntityType,
  entityId: string,
  mode: string
): Promise<void> {
  const now = Date.now();

  switch (entityType) {
    case 'blog':
      await db.transact([
        tx.blogs[entityId].update({
          editingMode: mode,
          updatedAt: now,
        }),
      ]);
      break;
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      await db.transact([
        tx.documents[entityId].update({
          editingMode: mode,
          updatedAt: now,
        }),
      ]);
      break;
  }
}
