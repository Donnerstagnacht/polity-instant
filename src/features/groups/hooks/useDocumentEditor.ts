/**
 * Document Editor Hook
 *
 * @deprecated Use `useEditor` from `@/features/editor` instead.
 * Import: `import { useEditor } from '@/features/editor';`
 * Usage: `const editorState = useEditor({ entityType: 'groupDocument', entityId, userId, groupId });`
 *
 * Manages document data fetching, auto-save logic, and state management
 * for the collaborative document editor.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import db, { tx } from '../../../../db/db';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { DocumentWithMetadata } from './useGroupDocuments';

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing...' }],
  },
];

interface UseDocumentEditorOptions {
  documentId: string;
  userId?: string;
}

interface UseDocumentEditorResult {
  // Document data
  document: DocumentWithMetadata | null;
  isLoading: boolean;
  hasAccess: boolean;

  // Editor state
  title: string;
  content: any[];
  discussions: any[];

  // State setters
  setTitle: (title: string) => void;
  setContent: (content: any[]) => void;
  setDiscussions: (discussions: any[]) => void;

  // Save status
  isSavingTitle: boolean;
  isSavingContent: boolean;
  isSavingDiscussions: boolean;
}

/**
 * Hook for managing document editor state and auto-save
 *
 * @param options - Configuration options
 * @returns Document data, editor state, and handlers
 *
 * @example
 * const {
 *   document,
 *   title,
 *   content,
 *   setTitle,
 *   setContent,
 *   isSavingTitle,
 * } = useDocumentEditor({ documentId, userId });
 */
export function useDocumentEditor(options: UseDocumentEditorOptions): UseDocumentEditorResult {
  const { documentId, userId } = options;

  // State
  const [title, setTitleState] = useState('');
  const [content, setContentState] = useState<any[]>(DEFAULT_CONTENT);
  const [discussions, setDiscussionsState] = useState<any[]>([]);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingDiscussions, setIsSavingDiscussions] = useState(false);

  // Refs
  const isInitialized = useRef(false);
  const isLocalChange = useRef(false);

  // Query document
  const { data: documentData, isLoading } = db.useQuery({
    documents: {
      owner: {},
      group: {},
      collaborators: {
        user: {},
      },
    },
  });

  const document = (documentData?.documents?.find((d: any) => d.id === documentId) ||
    null) as DocumentWithMetadata | null;

  // Check access
  const hasAccess = Boolean(document && (document.isPublic || document.owner?.id === userId));

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setTitleState(document.title || '');
      setContentState(document.content || DEFAULT_CONTENT);
      setDiscussionsState((document as any).discussions || []);
      isInitialized.current = true;
    }
  }, [document]);

  // Auto-save title (debounced)
  const titleAutoSave = useAutoSave({
    onSave: async (newTitle: string) => {
      if (!documentId || !newTitle.trim()) return;

      try {
        await db.transact([
          tx.documents[documentId].merge({
            title: newTitle,
            updatedAt: Date.now(),
          }),
        ]);
      } catch (error) {
        console.error('Failed to save title:', error);
        toast.error('Failed to save title');
        throw error;
      }
    },
    onSaveStart: () => setIsSavingTitle(true),
    onSaveEnd: () => setIsSavingTitle(false),
    debounceMs: 500,
    throttleMs: 2000,
  });

  // Auto-save content (throttled)
  const contentAutoSave = useAutoSave({
    onSave: async (newContent: any[]) => {
      if (!documentId || !userId) return;

      isLocalChange.current = true;

      try {
        await db.transact([
          tx.documents[documentId].merge({
            content: newContent,
            updatedAt: Date.now(),
          }),
        ]);
      } catch (error) {
        console.error('Content save failed:', error);
        toast.error('Failed to save content');
        throw error;
      }
    },
    onSaveStart: () => setIsSavingContent(true),
    onSaveEnd: () => setIsSavingContent(false),
    debounceMs: 300,
    throttleMs: 1000,
  });

  // Auto-save discussions (throttled)
  const discussionsAutoSave = useAutoSave({
    onSave: async (newDiscussions: any[]) => {
      if (!documentId || !userId) return;

      try {
        await db.transact([
          tx.documents[documentId].merge({
            discussions: newDiscussions,
            updatedAt: Date.now(),
          }),
        ]);
      } catch (error) {
        console.error('Discussions save failed:', error);
        toast.error('Failed to save comments');
        throw error;
      }
    },
    onSaveStart: () => setIsSavingDiscussions(true),
    onSaveEnd: () => setIsSavingDiscussions(false),
    debounceMs: 500,
    throttleMs: 1000,
  });

  // Title change handler
  const setTitle = useCallback(
    (newTitle: string) => {
      setTitleState(newTitle);
      titleAutoSave.save(newTitle);
    },
    [titleAutoSave]
  );

  // Content change handler
  const setContent = useCallback(
    (newContent: any[]) => {
      setContentState(newContent);
      contentAutoSave.save(newContent);
    },
    [contentAutoSave]
  );

  // Discussions change handler
  const setDiscussions = useCallback(
    (newDiscussions: any[]) => {
      // Check if actually changed
      const currentStr = JSON.stringify(discussions);
      const newStr = JSON.stringify(newDiscussions);

      if (currentStr === newStr) return;

      setDiscussionsState(newDiscussions);
      discussionsAutoSave.save(newDiscussions);
    },
    [discussions, discussionsAutoSave]
  );

  return {
    document,
    isLoading,
    hasAccess,
    title,
    content,
    discussions,
    setTitle,
    setContent,
    setDiscussions,
    isSavingTitle,
    isSavingContent,
    isSavingDiscussions,
  };
}
