/**
 * Unified Editor Version Hook
 *
 * Manages version control operations for all entity types.
 * Provides version history, creation, and restoration functionality.
 *
 * @module features/editor/hooks/useEditorVersion
 */

import { useState, useMemo, useCallback } from 'react';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useDocumentState } from '@/zero/documents/useDocumentState';
import { useBlogState } from '@/zero/blogs/useBlogState';
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
  const { createVersion: doCreateVersion, updateVersion: doUpdateVersion, deleteVersion: doDeleteVersion } = useDocumentActions();
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  // Build version queries via facade hooks
  const isBlog = entityType === 'blog';

  const { versions: docVersions, isLoading: docVersionsLoading } = useDocumentState({
    documentId: !isBlog ? entityId : '',
    includeVersions: !isBlog,
  });

  const { versions: blogVersions, isLoading: blogVersionsLoading } = useBlogState({
    blogId: isBlog ? entityId : undefined,
    includeVersions: isBlog,
  });

  const versions = (isBlog ? blogVersions : docVersions) as unknown as EditorVersion[];
  const isLoading = isBlog ? blogVersionsLoading : docVersionsLoading;

  // Sort versions by version number (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a: any, b: any) => b.version_number - a.version_number);
  }, [versions]);

  // Get the latest version number
  const latestVersionNumber = useMemo(() => {
    if (versions.length === 0) return 0;
    return Math.max(...versions.map((v: any) => v.version_number));
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
        const versionId = crypto.randomUUID();
        const newVersionNumber = latestVersionNumber + 1;

        const txData: any = {
          id: versionId,
          title: title.trim(),
          content: JSON.stringify(content),
          version_number: newVersionNumber,
          creation_type: creationType,
        };

        // Link to the appropriate entity
        if (entityType === 'blog') {
          txData.blog_id = entityId;
        } else {
          txData.document_id = entityId;
        }

        await doCreateVersion(txData);
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
        await doUpdateVersion({ id: versionId, change_summary: newTitle.trim() });
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
        await doDeleteVersion(versionId);
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
