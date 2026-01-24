/**
 * Main hook for blog editor state management
 *
 * @deprecated Use `useEditor` from `@/features/editor` instead.
 * Import: `import { useEditor } from '@/features/editor';`
 * Usage: `const editorState = useEditor({ entityType: 'blog', entityId: blogId, userId });`
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import db, { tx } from '../../../../db/db';
import { toast } from 'sonner';

interface UseBlogEditorProps {
  blogId: string;
  userId: string | undefined;
}

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start writing your blog post...' }],
  },
];

export function useBlogEditor({ blogId, userId }: UseBlogEditorProps) {
  // State
  const [blogTitle, setBlogTitle] = useState('');
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

  // Query blog with its data
  const { data: blogData, isLoading: blogLoading } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
      blogRoleBloggers: {
        user: {},
        role: {
          actionRights: {},
        },
      },
    },
  });

  const blog = blogData?.blogs?.[0];

  // Initialize blog data
  useEffect(() => {
    if (blog && !isInitialized.current) {
      setBlogTitle(blog.title || '');
      setEditorValue(blog.content || DEFAULT_CONTENT);
      setDiscussions((blog as any).discussions || []);
      isInitialized.current = true;
    }
  }, [blog]);

  // Sync discussions from database in real-time
  useEffect(() => {
    if (!blog || !isInitialized.current) return;

    const remoteDiscussions = (blog as any).discussions || [];
    const localDiscussionsStr = JSON.stringify(discussions);
    const remoteDiscussionsStr = JSON.stringify(remoteDiscussions);

    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000
    ) {
      setDiscussions(remoteDiscussions);
    }
  }, [(blog as any)?.discussions]);

  // Sync remote updates without destroying local selection
  useEffect(() => {
    if (!blog || !isInitialized.current) return;

    const remoteUpdatedAt = blog.updatedAt
      ? typeof blog.updatedAt === 'number'
        ? blog.updatedAt
        : new Date(blog.updatedAt).getTime()
      : 0;

    const remoteContent = blog.content || DEFAULT_CONTENT;
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
  }, [blog?.content, blog?.updatedAt, editorValue]);

  // Reset local change flag
  useEffect(() => {
    if (isLocalChange.current) {
      const timeout = setTimeout(() => {
        isLocalChange.current = false;
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [blog?.content]);

  // Get blog content (memoized)
  const blogContent = useMemo(() => {
    return editorValue || DEFAULT_CONTENT;
  }, [editorValue]);

  // Content change handler - throttled saves
  const handleContentChange = useCallback(
    async (newContent: any[]) => {
      if (!blogId || !userId) {
        console.warn('⚠️ Cannot save: missing blogId or userId', { blogId, userId });
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
          tx.blogs[blogId].merge({
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
    [blogId, userId]
  );

  // Save blog title (debounced)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setBlogTitle(newTitle);
      setHasUnsavedChanges(true);

      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      titleSaveTimeoutRef.current = setTimeout(async () => {
        if (!blogId || !newTitle.trim()) {
          console.warn('⚠️ Cannot save title: missing blogId or empty title', { blogId, newTitle });
          return;
        }

        setIsSavingTitle(true);
        setSaveStatus('saving');
        try {
          await db.transact([
            tx.blogs[blogId].merge({
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
    [blogId]
  );

  // Save discussions (debounced and deduped)
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: any[]) => {
      if (!blogId || !userId) {
        console.warn('⚠️ Cannot save discussions: missing blogId or userId', { blogId, userId });
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
          tx.blogs[blogId].merge({
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
    [blogId, userId, discussions]
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
    blogTitle,
    editorValue,
    discussions,
    blogContent,
    isSavingTitle,
    isEditingTitle,
    saveStatus,
    hasUnsavedChanges,

    // Data
    blog,
    blogLoading,

    // Handlers
    setIsEditingTitle,
    setDiscussions,
    handleContentChange,
    handleTitleChange,
    handleDiscussionsChange,
  };
}
