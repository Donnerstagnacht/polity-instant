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
import db, { tx } from '@db/db';
import { toast } from 'sonner';
import {
  adaptAmendmentToEntity,
  adaptBlogToEntity,
  adaptDocumentToEntity,
  adaptGroupDocumentToEntity,
} from '../utils/entity-adapter';
import {
  updateEntityContent,
  updateEntityTitle,
  updateEntityDiscussions,
  updateEntityMode,
  restoreVersion,
} from '../utils/version-utils';
import type {
  EditorEntityType,
  EditorEntity,
  EditorMode,
  EditorState,
  EditorActions,
  EditorCapabilities,
  DEFAULT_CAPABILITIES,
  TDiscussion,
} from '../types';
import { DEFAULT_EDITOR_CONTENT } from '../types';

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

  // State
  const [title, setTitleState] = useState('');
  const [content, setContentState] = useState<any[]>(DEFAULT_EDITOR_CONTENT);
  const [discussions, setDiscussionsState] = useState<TDiscussion[]>([]);
  const [mode, setModeState] = useState<EditorMode>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Query data based on entity type
  const { data: amendmentData, isLoading: amendmentLoading } = db.useQuery(
    entityType === 'amendment'
      ? {
          amendments: {
            $: { where: { id: entityId } },
            document: {
              owner: {},
              collaborators: {
                user: {},
              },
            },
            amendmentRoleCollaborators: {
              user: {},
            },
          },
        }
      : null
  );

  const { data: blogData, isLoading: blogLoading } = db.useQuery(
    entityType === 'blog'
      ? {
          blogs: {
            $: { where: { id: entityId } },
            blogRoleBloggers: {
              user: {},
              role: {
                actionRights: {},
              },
            },
          },
        }
      : null
  );

  const { data: documentData, isLoading: documentLoading } = db.useQuery(
    entityType === 'document'
      ? {
          documents: {
            $: { where: { id: entityId } },
            owner: {},
            collaborators: {
              user: {},
            },
          },
        }
      : null
  );

  const { data: groupDocData, isLoading: groupDocLoading } = db.useQuery(
    entityType === 'groupDocument'
      ? {
          documents: {
            $: { where: { id: entityId } },
            owner: {},
            group: {},
            collaborators: {
              user: {},
            },
          },
        }
      : null
  );

  // Derive loading state
  const isLoading =
    (entityType === 'amendment' && amendmentLoading) ||
    (entityType === 'blog' && blogLoading) ||
    (entityType === 'document' && documentLoading) ||
    (entityType === 'groupDocument' && groupDocLoading);

  // Adapt raw data to EditorEntity
  const entity = useMemo<EditorEntity | null>(() => {
    switch (entityType) {
      case 'amendment': {
        const amendment = amendmentData?.amendments?.[0];
        const document = amendment?.document;
        return adaptAmendmentToEntity(amendment, document);
      }
      case 'blog': {
        const blog = blogData?.blogs?.[0];
        return adaptBlogToEntity(blog);
      }
      case 'document': {
        const doc = documentData?.documents?.[0];
        return adaptDocumentToEntity(doc);
      }
      case 'groupDocument': {
        const doc = groupDocData?.documents?.find((d: any) => d.id === entityId);
        return adaptGroupDocumentToEntity(doc, groupId || '', doc?.group?.name);
      }
      default:
        return null;
    }
  }, [entityType, entityId, amendmentData, blogData, documentData, groupDocData, groupId]);

  // Get the content entity ID (document ID for amendments, blog ID for blogs, etc.)
  const contentEntityId = useMemo(() => {
    if (entityType === 'amendment') {
      return amendmentData?.amendments?.[0]?.document?.id || '';
    }
    return entityId;
  }, [entityType, entityId, amendmentData]);

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

  // Content change handler - throttled saves
  const setContent = useCallback(
    async (newContent: any[]) => {
      if (!contentEntityId || !userId) {
        console.warn('⚠️ Cannot save: missing entityId or userId', { contentEntityId, userId });
        return;
      }

      isLocalChange.current = true;
      setContentState(newContent);
      setHasUnsavedChanges(true);

      const now = Date.now();
      if (now - lastSaveTime.current < 1000) {
        return;
      }

      lastSaveTime.current = now;
      setSaveStatus('saving');

      try {
        await updateEntityContent(entityType, contentEntityId, newContent);
        lastRemoteUpdate.current = now;
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Content save failed:', error);
        setSaveStatus('error');
      }
    },
    [entityType, contentEntityId, userId]
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
          await updateEntityTitle(entityType, contentEntityId, newTitle);
        } catch (error) {
          console.error('Failed to save title:', error);
          toast.error('Failed to save title');
        } finally {
          setIsSavingTitle(false);
        }
      }, 500);
    },
    [entityType, contentEntityId, userId]
  );

  // Discussions change handler
  const setDiscussions = useCallback(
    async (newDiscussions: TDiscussion[]) => {
      setDiscussionsState(newDiscussions);
      lastDiscussionsSave.current = Date.now();

      if (!contentEntityId || !userId) return;

      try {
        await updateEntityDiscussions(entityType, contentEntityId, newDiscussions);
      } catch (error) {
        console.error('Failed to save discussions:', error);
      }
    },
    [entityType, contentEntityId, userId]
  );

  // Mode change handler
  const setMode = useCallback(
    async (newMode: EditorMode) => {
      if (!contentEntityId) return;

      try {
        await updateEntityMode(entityType, contentEntityId, newMode);
        setModeState(newMode);
        toast.success(`Mode changed to ${newMode}`);
      } catch (error) {
        console.error('Failed to change mode:', error);
        toast.error('Failed to change mode');
      }
    },
    [entityType, contentEntityId]
  );

  // Restore version handler
  const handleRestoreVersion = useCallback(
    async (versionContent: any[]) => {
      if (!contentEntityId || !userId) return;

      try {
        await restoreVersion(entityType, contentEntityId, versionContent);
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
    [entityType, contentEntityId, userId]
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
    const defaults = require('../types').DEFAULT_CAPABILITIES[entityType];
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
