/**
 * Unified Version Utilities
 *
 * Handles version creation and management for all entity types.
 */

import { createClient } from '@/lib/supabase/client';
import type { EditorEntityType, VersionCreationType } from '../types';

const supabase = createClient();

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
  // Build the filter based on entity type
  const filterColumn = getVersionFilterColumn(entityType);

  const { data: versionsData } = await supabase
    .from('document_version')
    .select('version_number')
    .eq(filterColumn, entityId);

  const versions = versionsData ?? [];
  const nextVersionNumber =
    versions.length > 0
      ? Math.max(...versions.map((v: any) => v.version_number)) + 1
      : 1;

  const versionTitle = title || getDefaultVersionTitle(creationType);

  const versionId = crypto.randomUUID();
  const linkColumn = getVersionLinkColumn(entityType);

  await supabase.from('document_version').insert({
    id: versionId,
    version_number: nextVersionNumber,
    title: versionTitle,
    content,
    created_at: Date.now(),
    creation_type: creationType,
    [linkColumn]: entityId,
    creator_id: userId,
  });
}

/**
 * Gets the appropriate filter column for querying versions
 */
function getVersionFilterColumn(entityType: EditorEntityType): string {
  switch (entityType) {
    case 'blog':
      return 'blog_id';
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return 'document_id';
  }
}

/**
 * Gets the appropriate link column for creating a version
 */
function getVersionLinkColumn(entityType: EditorEntityType): string {
  switch (entityType) {
    case 'blog':
      return 'blog_id';
    case 'amendment':
    case 'document':
    case 'groupDocument':
    default:
      return 'document_id';
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
    const filterColumn = getVersionFilterColumn(entityType);

    const { data: versionsData } = await supabase
      .from('document_version')
      .select('version_number')
      .eq(filterColumn, entityId);

    const versions = versionsData ?? [];
    if (versions.length === 0) return 0;

    return Math.max(...versions.map((v: any) => v.version_number));
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
  const table = entityType === 'blog' ? 'blog' : 'document';

  await supabase
    .from(table)
    .update({ content, updated_at: now })
    .eq('id', entityId);
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
  const table = entityType === 'blog' ? 'blog' : 'document';

  await supabase
    .from(table)
    .update({ content, updated_at: now })
    .eq('id', entityId);
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
  const table = entityType === 'blog' ? 'blog' : 'document';

  await supabase
    .from(table)
    .update({ title, updated_at: now })
    .eq('id', entityId);
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
  const table = entityType === 'blog' ? 'blog' : 'document';

  await supabase
    .from(table)
    .update({ discussions, updated_at: now })
    .eq('id', entityId);
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
  const table = entityType === 'blog' ? 'blog' : 'document';

  await supabase
    .from(table)
    .update({ editing_mode: mode, updated_at: now })
    .eq('id', entityId);
}
