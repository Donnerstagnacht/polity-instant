/**
 * Unified Editor Version Hook
 *
 * Manages version control operations for all entity types.
 * Provides version history, creation, and restoration functionality.
 *
 * @module features/editor/hooks/useEditorVersion
 */

import { useState, useMemo, useCallback } from 'react';
import { db, tx, id } from '@db/db';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import type { EditorEntityType, EditorVersion, VersionCreationType } from '../types';

interface UseEditorVersionOptions {
  /** The type of entity being edited */
  entityType: EditorEntityType;
  /** The entity ID (document ID for amendments, blog ID for blogs) */
  entityId: string;
  /** Current user ID */
  userId?: string;
}

interface UseEditorVersionResult {
  /** All versions for this entity */
  versions: EditorVersion[];
  /** Sorted versions (newest first) */
  sortedVersions: EditorVersion[];
  /** Whether versions are loading */
  isLoading: boolean;
  /** Latest version number */
  latestVersionNumber: number;
  /** Create a new version */
  createVersion: (
    title: string,
    content: any[],
    creationType?: VersionCreationType
  ) => Promise<void>;
  /** Restore a specific version */
  restoreVersion: (version: EditorVersion, onRestore: (content: any[]) => void) => Promise<void>;
  /** Update a version's title */
  updateVersionTitle: (versionId: string, newTitle: string) => Promise<void>;
  /** Delete a version */
  deleteVersion: (versionId: string) => Promise<void>;
  /** Whether a version is being created */
  isCreating: boolean;
}

/**
 * Hook for managing document/blog versions
 *
 * @param options - Configuration options
 * @returns Version control state and actions
 *
 * @example
 * const { versions, createVersion, restoreVersion } = useEditorVersion({
 *   entityType: 'amendment',
 *   entityId: documentId,
 *   userId: user.id,
 * });
 */
export function useEditorVersion(options: UseEditorVersionOptions): UseEditorVersionResult {
  const { entityType, entityId, userId } = options;
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  // Build the where clause based on entity type
  const whereClause = useMemo(() => {
    if (entityType === 'blog') {
      return { 'blog.id': entityId };
    }
    return { 'document.id': entityId };
  }, [entityType, entityId]);

  // Query all versions for this entity
  const { data: versionsData, isLoading } = db.useQuery({
    documentVersions: {
      $: {
        where: whereClause as any,
      },
      creator: {},
    },
  });

  const versions = (versionsData?.documentVersions || []) as EditorVersion[];

  // Sort versions by version number (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  }, [versions]);

  // Get the latest version number
  const latestVersionNumber = useMemo(() => {
    if (versions.length === 0) return 0;
    return Math.max(...versions.map(v => v.versionNumber));
  }, [versions]);

  // Create a new version
  const createVersion = useCallback(
    async (title: string, content: any[], creationType: VersionCreationType = 'manual') => {
      if (!userId) {
        toast.error(t('features.editor.versionControl.notLoggedIn'));
        return;
      }

      if (!title.trim()) {
        toast.error(t('features.editor.versionControl.enterTitle'));
        return;
      }

      setIsCreating(true);
      try {
        const versionId = id();
        const newVersionNumber = latestVersionNumber + 1;

        const txData: any = {
          title: title.trim(),
          content: JSON.stringify(content),
          versionNumber: newVersionNumber,
          creationType,
          createdAt: Date.now(),
        };

        // Link to the appropriate entity
        if (entityType === 'blog') {
          await db.transact([
            tx.documentVersions[versionId].update(txData),
            tx.documentVersions[versionId].link({ blog: entityId }),
            tx.documentVersions[versionId].link({ creator: userId }),
          ]);
        } else {
          await db.transact([
            tx.documentVersions[versionId].update(txData),
            tx.documentVersions[versionId].link({ document: entityId }),
            tx.documentVersions[versionId].link({ creator: userId }),
          ]);
        }

        toast.success(t('features.editor.versionControl.versionCreated'));
      } catch (error) {
        console.error('Failed to create version:', error);
        toast.error(t('features.editor.versionControl.createFailed'));
      } finally {
        setIsCreating(false);
      }
    },
    [entityType, entityId, userId, latestVersionNumber, t]
  );

  // Restore a version
  const restoreVersion = useCallback(
    async (version: EditorVersion, onRestore: (content: any[]) => void) => {
      try {
        const content =
          typeof version.content === 'string' ? JSON.parse(version.content) : version.content;

        onRestore(content);
        toast.success(t('features.editor.versionControl.versionRestored'));
      } catch (error) {
        console.error('Failed to restore version:', error);
        toast.error(t('features.editor.versionControl.restoreFailed'));
      }
    },
    [t]
  );

  // Update a version's title
  const updateVersionTitle = useCallback(
    async (versionId: string, newTitle: string) => {
      if (!newTitle.trim()) {
        toast.error(t('features.editor.versionControl.enterTitle'));
        return;
      }

      try {
        await db.transact([tx.documentVersions[versionId].update({ title: newTitle.trim() })]);
        toast.success(t('features.editor.versionControl.titleUpdated'));
      } catch (error) {
        console.error('Failed to update version title:', error);
        toast.error(t('features.editor.versionControl.updateFailed'));
      }
    },
    [t]
  );

  // Delete a version
  const deleteVersion = useCallback(
    async (versionId: string) => {
      try {
        await db.transact([tx.documentVersions[versionId].delete()]);
        toast.success(t('features.editor.versionControl.versionDeleted'));
      } catch (error) {
        console.error('Failed to delete version:', error);
        toast.error(t('features.editor.versionControl.deleteFailed'));
      }
    },
    [t]
  );

  return {
    versions,
    sortedVersions,
    isLoading,
    latestVersionNumber,
    createVersion,
    restoreVersion,
    updateVersionTitle,
    deleteVersion,
    isCreating,
  };
}
