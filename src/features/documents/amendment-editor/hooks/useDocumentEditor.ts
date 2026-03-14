/**
 * Main hook for document editor state management
 *
 * @deprecated Use `useEditor` from `@/features/editor` instead.
 * Import: `import { useEditor } from '@/features/editor';`
 * Usage: `const editorState = useEditor({ entityType: 'amendment', entityId: amendmentId, userId });`
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ReadonlyJSONValue } from '@rocicorp/zero';
import type { TDiscussion } from '@/features/shared/ui/kit-platejs/discussion-kit';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { toast } from 'sonner';

interface UseDocumentEditorProps {
  documentId?: string; // Optional - determined from amendmentId if not provided
  amendmentId: string;
  userId: string | undefined;
}

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing the amendment text...' }],
  },
];

const asReadonlyJsonArray = (value: ReadonlyJSONValue | null): ReadonlyJSONValue[] =>
  Array.isArray(value) ? [...value] : [...DEFAULT_CONTENT];

const asDiscussionList = (value: ReadonlyJSONValue | null): TDiscussion[] => {
  if (!Array.isArray(value)) return [];
  return value as TDiscussion[];
};

const toReadonlyJsonValue = (value: TDiscussion[] | ReadonlyJSONValue[]): ReadonlyJSONValue =>
  JSON.parse(JSON.stringify(value)) as ReadonlyJSONValue;

export function useDocumentEditor({ documentId, amendmentId, userId }: UseDocumentEditorProps) {
  const { updateDocument } = useDocumentActions();
  const { updateAmendment } = useAmendmentActions();
  // State
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editorValue, setEditorValue] = useState<ReadonlyJSONValue[] | null>(null);
  const [discussions, setDiscussions] = useState<TDiscussion[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Query amendment with its document and change requests via facade
  const {
    amendmentDocsCollabs: amendmentResults,
    changeRequestsWithVotes: changeRequestsResults,
    isLoading: facadeLoading,
  } = useAmendmentState({
    amendmentId,
    includeDocsAndCollabs: true,
    includeChangeRequestsWithVotes: true,
  });
  const amendmentLoading = facadeLoading;

  const amendment = amendmentResults;
  const document = amendment?.documents?.[0];

  // Use the queried document ID as the source of truth (fixes empty documentId parameter bug)
  const actualDocumentId = document?.id || documentId || '';

  const changeRequests = changeRequestsResults || [];

  // Initialize document data
  useEffect(() => {
    if (amendment && !isInitialized.current) {
      setDocumentTitle(amendment.title || '');
      setEditorValue(asReadonlyJsonArray(document?.content ?? null));
      setDiscussions(asDiscussionList(amendment.discussions ?? null));
      isInitialized.current = true;
    }
  }, [amendment, document]);

  // Sync discussions from database in real-time
  useEffect(() => {
    if (!amendment || !isInitialized.current) return;

    const remoteDiscussions = asDiscussionList(amendment.discussions ?? null);
    const localDiscussionsStr = JSON.stringify(discussions);
    const remoteDiscussionsStr = JSON.stringify(remoteDiscussions);

    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000
    ) {
      setDiscussions(remoteDiscussions);
    }
  }, [amendment?.discussions]);

  // Merge votes into discussions for display
  const discussionsWithVotes = useMemo(() => {
    if (!discussions || discussions.length === 0) return discussions;

    return discussions.map((discussion) => {
      const matchingChangeRequest = changeRequests.find((cr) => cr.title === discussion.crId);

      if (matchingChangeRequest && matchingChangeRequest.votes.length > 0) {
        return {
          ...discussion,
          votes: matchingChangeRequest.votes.map((vote) => ({
            id: vote.id,
            vote: vote.vote,
            voterId: vote.user?.id,
          })),
        };
      }

      return discussion;
    });
  }, [discussions, changeRequests]);

  // Sync remote updates without destroying local selection
  useEffect(() => {
    if (!document || !isInitialized.current) return;

    const remoteUpdatedAt = document.updated_at
      ? typeof document.updated_at === 'number'
        ? document.updated_at
        : new Date(document.updated_at).getTime()
      : 0;

    const remoteContent = asReadonlyJsonArray(document.content ?? null);
    const hasRemoteChanges = JSON.stringify(remoteContent) !== JSON.stringify(editorValue);

    if (
      remoteUpdatedAt > lastRemoteUpdate.current &&
      hasRemoteChanges &&
      !isLocalChange.current &&
      Date.now() - lastSaveTime.current > 1500
    ) {
      setEditorValue(remoteContent);
      lastRemoteUpdate.current = remoteUpdatedAt;
    }
  }, [document?.content, document?.updated_at, editorValue]);

  // Reset local change flag
  useEffect(() => {
    if (isLocalChange.current) {
      const timeout = setTimeout(() => {
        isLocalChange.current = false;
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [document?.content]);

  // Get document content (memoized)
  const documentContent = useMemo(() => {
    return editorValue || DEFAULT_CONTENT;
  }, [editorValue]);

  // Content change handler - throttled saves
  const handleContentChange = useCallback(
    async (newContent: ReadonlyJSONValue[]) => {
      if (!actualDocumentId || !userId) {
        console.warn('⚠️ Cannot save: missing documentId or userId', { actualDocumentId, userId });
        return;
      }

      isLocalChange.current = true;
      setEditorValue(newContent);
      setHasUnsavedChanges(true);

      const now = Date.now();
      if (now - lastSaveTime.current < 1000) {
        return;
      }

      lastSaveTime.current = now;
      setSaveStatus('saving');

      try {
        await updateDocument({
          id: actualDocumentId,
          content: toReadonlyJsonValue(newContent),
        });
        lastRemoteUpdate.current = now;
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('❌ Content save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save content. Please try again.');
      }
    },
    [actualDocumentId, userId]
  );

  // Save document title (debounced)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDocumentTitle(newTitle);
      setHasUnsavedChanges(true);

      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      titleSaveTimeoutRef.current = setTimeout(async () => {
        if (!amendmentId || !newTitle.trim()) {
          console.warn('⚠️ Cannot save title: missing amendmentId or empty title', {
            amendmentId,
            newTitle,
          });
          return;
        }

        setIsSavingTitle(true);
        setSaveStatus('saving');
        try {
          await updateAmendment({
            id: amendmentId,
            title: newTitle,
          });
          setSaveStatus('saved');
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('❌ Failed to save title:', error);
          setSaveStatus('error');
          toast.error('Failed to save title. Please try again.');
        } finally {
          setIsSavingTitle(false);
        }
      }, 500);
    },
    [amendmentId]
  );

  // Save discussions (debounced and deduped)
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: TDiscussion[]) => {
      if (!amendmentId || !userId) {
        console.warn('⚠️ Cannot save discussions: missing amendmentId or userId', {
          amendmentId,
          userId,
        });
        return;
      }

      const currentDiscussionsStr = JSON.stringify(discussions);
      const newDiscussionsStr = JSON.stringify(newDiscussions);

      if (currentDiscussionsStr === newDiscussionsStr) {
        return;
      }

      setDiscussions(newDiscussions);
      setHasUnsavedChanges(true);

      const now = Date.now();
      const timeSinceLastSave = now - lastDiscussionsSave.current;

      if (timeSinceLastSave < 1000) {
        setTimeout(() => {
          handleDiscussionsChange(newDiscussions);
        }, 1000 - timeSinceLastSave);
        return;
      }

      lastDiscussionsSave.current = now;
      setSaveStatus('saving');

      try {
        await updateAmendment({
          id: amendmentId,
          discussions: toReadonlyJsonValue(newDiscussions),
        });
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('❌ Discussions save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save comments. Please try again.');
      }
    },
    [amendmentId, userId, discussions]
  );

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
    };
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saveStatus]);

  return {
    // State
    documentTitle,
    editorValue,
    discussions,
    discussionsWithVotes,
    documentContent,
    isSavingTitle,
    isEditingTitle,
    saveStatus,
    hasUnsavedChanges,

    // Data
    amendment,
    document,
    changeRequests,
    amendmentLoading,

    // Handlers
    setIsEditingTitle,
    setDiscussions,
    handleContentChange,
    handleTitleChange,
    handleDiscussionsChange,
  };
}
