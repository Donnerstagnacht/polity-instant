/**
 * Unified Editor Hook
 *
 * Main hook for managing editor state across all entity types.
 * Handles content loading, saving, real-time sync, and discussions.
 *
 * @module features/editor/hooks/useEditor
 *
 * @example
 * ```tsx
 * import { useEditor } from '@/features/editor';
 *
 * function MyEditorPage({ entityId }) {
 *   const {
 *     title, content, discussions, mode,
 *     setTitle, setContent, setDiscussions, setMode,
 *     saveStatus, hasUnsavedChanges, isLoading
 *   } = useEditor({
 *     entityType: 'amendment',
 *     entityId,
 *     userId: user?.id,
 *   });
 *
 *   return (
 *     <PlateEditor
 *       value={content}
 *       onChange={setContent}
 *       discussions={discussions}
 *       onDiscussionsUpdate={setDiscussions}
 *     />
 *   );
 * }
 * ```
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useZero } from '@rocicorp/zero/react';
import type { ReadonlyJSONValue } from '@rocicorp/zero';
import type { Value } from 'platejs';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useDocumentState } from '@/zero/documents/useDocumentState';
import { mutators } from '@/zero/mutators';
import { toast } from 'sonner';
import {
  adaptAmendmentToEntity,
  adaptBlogToEntity,
  adaptDocumentToEntity,
  adaptGroupDocumentToEntity,
} from '../logic/entity-adapter';
import type {
  EditorEntityType,
  EditorEntity,
  EditorMode,
  EditorState,
  EditorActions,
  EditorCapabilities,
  TDiscussion,
} from '../types';
import { DEFAULT_CAPABILITIES, DEFAULT_EDITOR_CONTENT } from '../types';

/**
 * Options for the useEditor hook
 */
interface UseEditorOptions {
  /** The type of entity being edited */
  entityType: EditorEntityType;
  /** The ID of the entity to edit */
  entityId: string;
  /** Current user ID (required for saving) */
  userId?: string;
  /** For group documents - the parent group ID */
  groupId?: string;
  /** Override default capabilities for this entity type */
  capabilities?: Partial<EditorCapabilities>;
}

/**
 * Unified editor hook for all entity types
 *
 * @param options - Editor configuration options
 * @returns Editor state and actions
 */
export function useEditor(options: UseEditorOptions): EditorState & EditorActions {
  const { entityType, entityId, userId, groupId } = options;
  const zero = useZero();

  // Query data based on entity type via facade hooks
  const amId = entityType === 'amendment' ? entityId : undefined;
  const blId = entityType === 'blog' ? entityId : undefined;
  const dcId = (entityType === 'document' || entityType === 'groupDocument') ? entityId : '';

  const { amendmentDocsCollabs, isLoading: amendmentLoading } = useAmendmentState({
    amendmentId: amId,
    includeDocsAndCollabs: !!amId,
  });

  const { blogForEditor, isLoading: blogLoading } = useBlogState({
    blogId: blId,
    includeForEditor: !!blId,
  });

  const { document: documentData, isLoading: documentLoading } = useDocumentState({
    documentId: dcId,
    includeCollaborators: true,
  });

  // State
  const [title, setTitleState] = useState('');
  const [content, setContentState] = useState<Value>(DEFAULT_EDITOR_CONTENT);
  const [discussions, setDiscussionsState] = useState<TDiscussion[]>([]);
  const [mode, setModeState] = useState<EditorMode>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Derive loading state
  const isLoading =
    (entityType === 'amendment' && amendmentLoading) ||
    (entityType === 'blog' && blogLoading) ||
    (entityType === 'document' && documentLoading) ||
    (entityType === 'groupDocument' && documentLoading);

  // Adapt raw data to EditorEntity
  const entity = useMemo<EditorEntity | null>(() => {
    switch (entityType) {
      case 'amendment': {
        if (!amendmentDocsCollabs) return null;
        const docs = amendmentDocsCollabs.documents;
        const doc = Array.isArray(docs) ? docs[0] : undefined;
        if (!doc) return null;
        return adaptAmendmentToEntity(amendmentDocsCollabs, doc);
      }
      case 'blog': {
        if (!blogForEditor) return null;
        return adaptBlogToEntity(blogForEditor);
      }
      case 'document': {
        if (!documentData) return null;
        return adaptDocumentToEntity(documentData);
      }
      case 'groupDocument': {
        if (!documentData) return null;
        return adaptGroupDocumentToEntity(documentData, groupId || '', undefined);
      }
      default:
        return null;
    }
  }, [entityType, entityId, amendmentDocsCollabs, blogForEditor, documentData, groupId]);

  // Get the content entity ID (document ID for amendments, blog ID for blogs, etc.)
  const contentEntityId = useMemo(() => {
    if (entityType === 'amendment') {
      const docs = amendmentDocsCollabs?.documents;
      const doc = Array.isArray(docs) ? docs[0] : undefined;
      return doc?.id ?? '';
    }
    return entityId;
  }, [entityType, entityId, amendmentDocsCollabs]);

  // Initialize entity data
  useEffect(() => {
    if (entity && !isInitialized.current) {
      setTitleState(entity.title || '');
      setContentState(entity.content || DEFAULT_EDITOR_CONTENT);
      setDiscussionsState(entity.discussions || []);
      setModeState(entity.editingMode || 'edit');
      isInitialized.current = true;
    }
  }, [entity]);

  // Sync discussions from database in real-time
  useEffect(() => {
    if (!entity || !isInitialized.current) return;

    const remoteDiscussions = entity.discussions || [];
    const localDiscussionsStr = JSON.stringify(discussions);
    const remoteDiscussionsStr = JSON.stringify(remoteDiscussions);

    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000
    ) {
      setDiscussionsState(remoteDiscussions);
    }
  }, [entity?.discussions, discussions]);

  // Sync remote content updates without destroying local selection
  useEffect(() => {
    if (!entity || !isInitialized.current) return;

    const remoteUpdatedAt = entity.updatedAt || 0;
    const remoteContent = entity.content || DEFAULT_EDITOR_CONTENT;
    const hasRemoteChanges = JSON.stringify(remoteContent) !== JSON.stringify(content);

    if (
      remoteUpdatedAt > lastRemoteUpdate.current &&
      hasRemoteChanges &&
      !isLocalChange.current &&
      Date.now() - lastSaveTime.current > 1500
    ) {
      setContentState(remoteContent);
      lastRemoteUpdate.current = remoteUpdatedAt;
    }
  }, [entity?.content, entity?.updatedAt, content]);

  // Reset local change flag
  useEffect(() => {
    if (isLocalChange.current) {
      const timeout = setTimeout(() => {
        isLocalChange.current = false;
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [entity?.content]);

  // Persist content via Zero
  const saveContent = useCallback(
    async (newContent: Value) => {
      setSaveStatus('saving');
      try {
        if (entityType === 'blog') {
          await zero.mutate(mutators.blogs.update({ id: contentEntityId, content: newContent as ReadonlyJSONValue[] }));
        } else {
          await zero.mutate(mutators.documents.updateContent({ id: contentEntityId, content: newContent as ReadonlyJSONValue[] }));
        }
        lastSaveTime.current = Date.now();
        lastRemoteUpdate.current = Date.now();
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Content save failed:', error);
        setSaveStatus('error');
      }
    },
    [entityType, contentEntityId, zero]
  );

  // Content change handler - throttled with trailing edge
  const setContent = useCallback(
    (newContent: Value) => {
      if (!contentEntityId || !userId) {
        console.warn('⚠️ Cannot save: missing entityId or userId', { contentEntityId, userId });
        return;
      }

      isLocalChange.current = true;
      setContentState(newContent);
      setHasUnsavedChanges(true);

      // Clear any pending trailing save
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }

      const now = Date.now();
      if (now - lastSaveTime.current >= 1000) {
        // Leading edge: save immediately
        saveContent(newContent);
      } else {
        // Trailing edge: schedule save after throttle window
        contentSaveTimeoutRef.current = setTimeout(() => {
          saveContent(newContent);
        }, 1000);
      }
    },
    [contentEntityId, userId, saveContent]
  );

  // Title change handler - debounced
  const setTitle = useCallback(
    (newTitle: string) => {
      setTitleState(newTitle);

      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      titleSaveTimeoutRef.current = setTimeout(async () => {
        if (!contentEntityId || !userId) return;

        setIsSavingTitle(true);
        try {
          if (entityType === 'blog') {
            await zero.mutate(mutators.blogs.update({ id: contentEntityId, title: newTitle }));
          } else {
            // Documents don't have a title field — title lives on the parent entity
          }
        } catch (error) {
          console.error('Failed to save title:', error);
          toast.error('Failed to save title');
        } finally {
          setIsSavingTitle(false);
        }
      }, 500);
    },
    [entityType, contentEntityId, userId, zero]
  );

  // Discussions change handler
  const setDiscussions = useCallback(
    async (newDiscussions: TDiscussion[]) => {
      setDiscussionsState(newDiscussions);
      lastDiscussionsSave.current = Date.now();

      if (!contentEntityId || !userId) return;

      try {
        const serializedDiscussions: ReadonlyJSONValue = JSON.parse(JSON.stringify(newDiscussions));
        if (entityType === 'blog') {
          await zero.mutate(mutators.blogs.update({ id: contentEntityId, discussions: serializedDiscussions }));
        } else {
          await zero.mutate(mutators.documents.updateContent({ id: contentEntityId, content: serializedDiscussions }));
        }
      } catch (error) {
        console.error('Failed to save discussions:', error);
      }
    },
    [entityType, contentEntityId, userId, zero]
  );

  // Mode change handler
  const setMode = useCallback(
    async (newMode: EditorMode) => {
      if (!contentEntityId) return;

      try {
        if (entityType === 'blog') {
          await zero.mutate(mutators.blogs.update({ id: contentEntityId, editing_mode: newMode }));
        } else {
          await zero.mutate(mutators.documents.updateContent({ id: contentEntityId, editing_mode: newMode }));
        }
        setModeState(newMode);
        toast.success(`Mode changed to ${newMode}`);
      } catch (error) {
        console.error('Failed to change mode:', error);
        toast.error('Failed to change mode');
      }
    },
    [entityType, contentEntityId, zero]
  );

  // Restore version handler
  const handleRestoreVersion = useCallback(
    async (versionContent: Value) => {
      if (!contentEntityId || !userId) return;

      try {
        if (entityType === 'blog') {
          await zero.mutate(mutators.blogs.update({ id: contentEntityId, content: versionContent as ReadonlyJSONValue[] }));
        } else {
          await zero.mutate(mutators.documents.updateContent({ id: contentEntityId, content: versionContent as ReadonlyJSONValue[] }));
        }
        isLocalChange.current = true;
        setContentState(versionContent);
        lastSaveTime.current = Date.now();
        lastRemoteUpdate.current = Date.now();
        toast.success('Version restored successfully');
      } catch (error) {
        console.error('Failed to restore version:', error);
        toast.error('Failed to restore version');
      }
    },
    [entityType, contentEntityId, userId, zero]
  );

  // Access checks
  const hasAccess = useMemo(() => {
    if (!entity) return false;
    if (entity.isPublic) return true;
    if (!userId) return false;
    if (entity.owner?.id === userId) return true;
    return entity.collaborators.some(c => c.user.id === userId);
  }, [entity, userId]);

  const isOwnerOrCollaborator = useMemo(() => {
    if (!entity || !userId) return false;
    if (entity.owner?.id === userId) return true;
    return entity.collaborators.some(
      c => c.user.id === userId && (c.status === 'owner' || c.status === 'admin' || c.canEdit)
    );
  }, [entity, userId]);

  // Merge capabilities
  const capabilities = useMemo(() => {
    const defaults = DEFAULT_CAPABILITIES[entityType];
    return { ...defaults, ...options.capabilities };
  }, [entityType, options.capabilities]);

  return {
    // Entity data
    entity,
    isLoading,
    error: null,

    // Editor state
    title,
    content,
    discussions,
    mode,

    // Save status
    saveStatus,
    hasUnsavedChanges,
    isSavingTitle,

    // Access
    hasAccess,
    isOwnerOrCollaborator,

    // Capabilities
    capabilities,

    // Actions
    setTitle,
    setContent,
    setDiscussions,
    setMode,
    restoreVersion: handleRestoreVersion,
  };
}
