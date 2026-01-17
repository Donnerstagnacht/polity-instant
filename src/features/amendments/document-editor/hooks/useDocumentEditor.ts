/**
 * Main hook for document editor state management
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import db, { tx } from '../../../../../db/db';
import { toast } from 'sonner';

interface UseDocumentEditorProps {
  documentId?: string; // Optional - determined from amendmentId if not provided
  amendmentId: string;
  userId: string | undefined;
}

interface EditorState {
  documentTitle: string;
  editorValue: any[] | null;
  discussions: any[];
  isSavingTitle: boolean;
  isEditingTitle: boolean;
}

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing the amendment text...' }],
  },
];

export function useDocumentEditor({ documentId, amendmentId, userId }: UseDocumentEditorProps) {
  // State
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editorValue, setEditorValue] = useState<any[] | null>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Query amendment with its document
  const { data: amendmentData, isLoading: amendmentLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
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
  });

  const amendment = amendmentData?.amendments?.[0];
  const document = amendment?.document;
  
  // Use the queried document ID as the source of truth (fixes empty documentId parameter bug)
  const actualDocumentId = document?.id || documentId || '';

  // Fetch changeRequests with votes
  const { data: changeRequestsData } = db.useQuery(
    amendment?.id
      ? {
          changeRequests: {
            $: {
              where: {
                'amendment.id': amendment.id,
              },
            },
            votes: {
              voter: {},
            },
          },
        }
      : null
  );

  const changeRequests = changeRequestsData?.changeRequests || [];

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setDocumentTitle(document.title || '');
      setEditorValue(document.content || DEFAULT_CONTENT);
      setDiscussions((document as any).discussions || []);
      isInitialized.current = true;
    }
  }, [document]);

  // Sync discussions from database in real-time
  useEffect(() => {
    if (!document || !isInitialized.current) return;

    const remoteDiscussions = (document as any).discussions || [];
    const localDiscussionsStr = JSON.stringify(discussions);
    const remoteDiscussionsStr = JSON.stringify(remoteDiscussions);

    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000
    ) {
      setDiscussions(remoteDiscussions);
    }
  }, [(document as any)?.discussions]);

  // Merge votes into discussions for display
  const discussionsWithVotes = useMemo(() => {
    if (!discussions || discussions.length === 0) return discussions;

    return discussions.map((discussion: any) => {
      const matchingChangeRequest = changeRequests.find((cr: any) => cr.title === discussion.crId);

      if (matchingChangeRequest && matchingChangeRequest.votes) {
        return {
          ...discussion,
          votes: matchingChangeRequest.votes.map((vote: any) => ({
            id: vote.id,
            vote: vote.vote,
            voterId: vote.voter?.id,
          })),
        };
      }

      return discussion;
    });
  }, [discussions, changeRequests]);

  // Sync remote updates without destroying local selection
  useEffect(() => {
    if (!document || !isInitialized.current) return;

    const remoteUpdatedAt = document.updatedAt
      ? typeof document.updatedAt === 'number'
        ? document.updatedAt
        : new Date(document.updatedAt).getTime()
      : 0;

    const remoteContent = document.content || DEFAULT_CONTENT;
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
  }, [document?.content, document?.updatedAt, editorValue]);

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
    async (newContent: any[]) => {
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
        await db.transact([
          tx.documents[actualDocumentId].merge({
            content: newContent,
            updatedAt: now,
          }),
        ]);
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
        if (!actualDocumentId || !newTitle.trim()) {
          console.warn('⚠️ Cannot save title: missing documentId or empty title', { actualDocumentId, newTitle });
          return;
        }

        setIsSavingTitle(true);
        setSaveStatus('saving');
        try {
          await db.transact([
            tx.documents[actualDocumentId].merge({
              title: newTitle,
              updatedAt: Date.now(),
            }),
          ]);
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
    [actualDocumentId]
  );

  // Save discussions (debounced and deduped)
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: any[]) => {
      if (!actualDocumentId || !userId) {
        console.warn('⚠️ Cannot save discussions: missing documentId or userId', { actualDocumentId, userId });
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
        await db.transact([
          tx.documents[actualDocumentId].merge({
            discussions: newDiscussions,
            updatedAt: now,
          }),
        ]);
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('❌ Discussions save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save comments. Please try again.');
      }
    },
    [actualDocumentId, userId, discussions]
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
