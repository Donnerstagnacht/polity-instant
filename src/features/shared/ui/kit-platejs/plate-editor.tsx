import * as React from 'react';

import { type Value, type TElement } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/features/shared/ui/kit-platejs/editor-kit.tsx';
import { discussionPlugin } from '@/features/shared/ui/kit-platejs/discussion-kit.tsx';
import { suggestionPlugin } from '@/features/shared/ui/kit-platejs/suggestion-kit.tsx';
import { SettingsDialog } from '@/features/shared/ui/kit-platejs/settings-dialog.tsx';
import { Editor, EditorContainer } from '@/features/shared/ui/ui-platejs/editor.tsx';
import { SuggestionCallbacksProvider } from '@/features/shared/ui/kit-platejs/suggestion-callbacks-context.tsx';
import { ModeProvider } from '@/features/shared/ui/kit-platejs/mode-context.tsx';
import { ModeSync } from '@/features/shared/ui/kit-platejs/mode-sync.tsx';
import type { TDiscussion } from '@/features/shared/ui/kit-platejs/discussion-kit.tsx';
import { RemoteCursorsSync } from '@/features/editor/ui/RemoteCursorsSync';
import type { ResolvedSuggestion } from '@/features/shared/ui/ui-platejs/block-suggestion.tsx';

interface PlateEditorProps {
  initialValue?: Value;
  value?: Value; // Controlled mode
  onChange?: (value: Value) => void;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  users?: Record<string, { id: string; name: string; avatarUrl: string }>;
  discussions?: TDiscussion[]; // Discussions/comments data
  onDiscussionsChange?: (discussions: TDiscussion[]) => void;
  onSuggestionAccepted?: (suggestion: ResolvedSuggestion) => void;
  onSuggestionDeclined?: (suggestion: ResolvedSuggestion) => void;
  onVoteAccept?: (suggestion: ResolvedSuggestion) => void; // Vote accept callback
  onVoteReject?: (suggestion: ResolvedSuggestion) => void; // Vote reject callback
  onVoteAbstain?: (suggestion: ResolvedSuggestion) => void; // Vote abstain callback
  documentId?: string; // Document ID for suggestion ID generation
  documentTitle?: string; // Document title to show in discussions/suggestions
  currentMode?: 'edit' | 'view' | 'suggest' | 'vote'; // Current editing mode from DB
  onModeChange?: (mode: 'edit' | 'view' | 'suggest' | 'vote') => void; // Mode change callback
  isOwnerOrCollaborator?: boolean; // Whether user can change modes
  /** Remote cursor sync props */
  remoteCursors?: {
    entityId: string;
    userId?: string;
    userName?: string;
    userColor?: string;
    enabled?: boolean;
    onActiveCursorsChange?: (userIds: Set<string>) => void;
  };
}

export function PlateEditor({
  initialValue,
  value,
  onChange,
  currentUser,
  users,
  discussions,
  onDiscussionsChange,
  onSuggestionAccepted,
  onSuggestionDeclined,
  onVoteAccept,
  onVoteReject,
  onVoteAbstain,
  documentId,
  documentTitle,
  currentMode,
  onModeChange,
  isOwnerOrCollaborator = true,
  remoteCursors,
}: PlateEditorProps) {
  const onChangeRef = React.useRef(onChange);
  const isControlled = value !== undefined;
  const prevValueRef = React.useRef(value);

  // Capture the initial value in a ref so the editor is created once,
  // not re-created on every controlled value change.
  const initialValueRef = React.useRef(isControlled ? value : initialValue || defaultValue);

  // Update the ref when onChange changes, but don't cause re-render
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Memoize the editor configuration to prevent unnecessary re-creations.
  // `value` is intentionally NOT a dependency — the initial value is captured
  // in a ref above, and subsequent controlled updates go through the effect below.
  const editorConfig = React.useMemo(() => {
    const baseValue = initialValueRef.current;

    if (currentUser && users) {
      return {
        plugins: EditorKit,
        value: baseValue,
        override: {
          plugins: {
            discussion: {
              options: {
                currentUserId: currentUser.id,
                users: users,
                discussions: discussions || [],
                documentTitle: documentTitle || '',
                documentId: documentId || '',
              },
            },
          },
        },
      };
    }

    return {
      plugins: EditorKit,
      value: baseValue,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, initialValue, currentUser, users, documentTitle, documentId]);

  const editor = usePlateEditor(editorConfig);

  // Load initial discussions from props on first mount
  const hasLoadedInitialDiscussions = React.useRef(false);
  React.useEffect(() => {
    if (editor && discussions && discussions.length > 0 && !hasLoadedInitialDiscussions.current) {
      editor.setOptions(discussionPlugin, {
        discussions: discussions,
      });
      hasLoadedInitialDiscussions.current = true;
    }
  }, [editor, discussions]);

  // Update discussion plugin options when currentUser or users change
  React.useEffect(() => {
    if (currentUser && users && editor) {
      // Get current discussions from editor
      const currentEditorDiscussions = editor.getOption(discussionPlugin, 'discussions') || [];

      // Check if discussions have changed
      const propsDiscussionsStr = JSON.stringify(discussions || []);
      const editorDiscussionsStr = JSON.stringify(currentEditorDiscussions);
      const discussionsChanged = propsDiscussionsStr !== editorDiscussionsStr;

      // Prefer editor discussions if they have more items (user may have added new discussions)
      // Otherwise, use props discussions (which may have updated votes)
      const shouldUsePropsDiscussions =
        discussionsChanged && discussions && discussions.length >= currentEditorDiscussions.length;

      // Update discussion plugin options
      editor.setOptions(discussionPlugin, {
        currentUserId: currentUser.id,
        users: users,
        documentTitle: documentTitle || '',
        // Use props discussions if they're newer/different and have at least as many items
        discussions: shouldUsePropsDiscussions ? discussions : currentEditorDiscussions,
      });

      // Also update suggestion plugin's currentUserId
      editor.setOptions(suggestionPlugin, {
        currentUserId: currentUser.id,
      });
    }
  }, [currentUser, users, discussions, documentTitle, editor]); // Added documentTitle

  // Watch for changes in discussions and call callback
  React.useEffect(() => {
    if (!editor || !onDiscussionsChange) return;

    // Set up an interval to check for discussion changes
    const interval = setInterval(() => {
      const currentDiscussions = editor.getOption(discussionPlugin, 'discussions');

      // Clean up orphaned discussions (where the comment/suggestion marks no longer exist in content)
      if (currentDiscussions && currentDiscussions.length > 0) {
        const activeDiscussionIds = new Set<string>();

        // Scan the editor content for comment marks
        const commentNodes = editor.api.nodes({
          at: [],
          match: (n: TElement) => {
            if (!n) return false;
            // Check if node has comment_* properties
            return Object.keys(n).some(key => key.startsWith('comment_') && key !== 'comment');
          },
        });

        for (const [node] of commentNodes) {
          Object.keys(node).forEach(key => {
            if (key.startsWith('comment_') && key !== 'comment') {
              const discussionId = key.replace('comment_', '');
              activeDiscussionIds.add(discussionId);
            }
          });
        }

        // Also scan for suggestion marks
        const suggestionNodes = editor.api.nodes({
          at: [],
          match: (n: TElement) => {
            if (!n) return false;
            // Check if node has suggestion_* properties or has suggestion data
            return Object.keys(n).some(key => key.startsWith('suggestion_')) || n.suggestion;
          },
        });

        for (const [node] of suggestionNodes) {
          // Extract suggestion IDs from suggestion_* keys
          Object.keys(node).forEach(key => {
            if (key.startsWith('suggestion_')) {
              const suggestionId = key.replace('suggestion_', '');
              activeDiscussionIds.add(suggestionId);
            }
          });

          // Also check the suggestion property for block suggestions
          if (node.suggestion && typeof node.suggestion === 'object' && 'id' in node.suggestion) {
            activeDiscussionIds.add(node.suggestion.id as string);
          }
        }

        // Filter discussions to only keep those with active marks
        const cleanedDiscussions = currentDiscussions.filter((d: TDiscussion) =>
          activeDiscussionIds.has(d.id)
        );

        if (cleanedDiscussions.length !== currentDiscussions.length) {
          editor.setOptions(discussionPlugin, {
            discussions: cleanedDiscussions,
          });

          onDiscussionsChange(cleanedDiscussions);
          return;
        }
      }

      // Always call onChange with current discussions
      if (currentDiscussions) {
        onDiscussionsChange(currentDiscussions);
      }
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(interval);
    };
  }, [editor, onDiscussionsChange]); // Removed 'discussions' from dependencies

  // Update editor value when controlled value changes (without destroying selection)
  const isUpdatingFromProps = React.useRef(false);
  React.useEffect(() => {
    // This effect now only fires for genuine external changes (init, remote
    // content, version restore) because local edits no longer update the
    // content state in useEditor — so the `value` prop stays stable.
    if (isControlled && value && prevValueRef.current !== value) {
      try {
        // Reset selection before swapping content to prevent toolbar
        // crashes from stale paths (e.g. MarkToolbarButton → getMarks).
        editor.selection = null;
        isUpdatingFromProps.current = true;
        editor.children = value as Value;
        // Trigger a re-render without calling parent onChange
        if (typeof editor.onChange === 'function') {
          (editor as unknown as { onChange: () => void }).onChange();
        }
      } catch (e) {
        console.warn('Failed to update editor value:', e);
      } finally {
        isUpdatingFromProps.current = false;
      }
      prevValueRef.current = value;
    }
  }, [value, isControlled, editor]);

  // Handle changes from the editor using ref to avoid recreating function
  const handleEditorChange = React.useCallback(({ value: newValue }: { value: Value }) => {
    // Skip onChange triggered by controlled value updates to prevent feedback loops
    if (isUpdatingFromProps.current) return;
    if (onChangeRef.current) {
      onChangeRef.current(newValue);
    }
  }, []);

  return (
    <ModeProvider
      currentMode={currentMode}
      onModeChange={onModeChange}
      isOwnerOrCollaborator={isOwnerOrCollaborator}
    >
      <SuggestionCallbacksProvider
        callbacks={{
          onSuggestionAccepted,
          onSuggestionDeclined,
          onVoteAccept,
          onVoteReject,
          onVoteAbstain,
        }}
      >
        <Plate editor={editor} onChange={handleEditorChange}>
          {/* Sync external mode with PlateJS internal state */}
          <ModeSync currentMode={currentMode} />

          {/* Sync remote cursors via Supabase Realtime */}
          {remoteCursors?.enabled && (
            <RemoteCursorsSync
              entityId={remoteCursors.entityId}
              userId={remoteCursors.userId}
              userName={remoteCursors.userName}
              userColor={remoteCursors.userColor}
              enabled={remoteCursors.enabled}
              onActiveCursorsChange={remoteCursors.onActiveCursorsChange}
            />
          )}

          <EditorContainer>
            <Editor variant="demo" />
          </EditorContainer>

          <SettingsDialog />
        </Plate>
      </SuggestionCallbacksProvider>
    </ModeProvider>
  );
}

const value = [
  {
    children: [{ text: 'Welcome to the Plate Playground!' }],
    type: 'h1',
  },
  {
    children: [
      { text: 'Experience a modern rich-text editor built with ' },
      { children: [{ text: 'Slate' }], type: 'a', url: 'https://slatejs.org' },
      { text: ' and ' },
      { children: [{ text: 'React' }], type: 'a', url: 'https://reactjs.org' },
      {
        text: ". This playground showcases just a part of Plate's capabilities. ",
      },
      {
        children: [{ text: 'Explore the documentation' }],
        type: 'a',
        url: '/docs',
      },
      { text: ' to discover more.' },
    ],
    type: 'p',
  },
  // Suggestions & Comments Section
  {
    children: [{ text: 'Collaborative Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Review and refine content seamlessly. Use ' },
      {
        children: [
          {
            suggestion: true,
            suggestion_playground1: {
              id: 'playground1',
              createdAt: Date.now(),
              type: 'insert',
              userId: 'alice',
            },
            text: 'suggestions',
          },
        ],
        type: 'a',
        url: '/docs/suggestion',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: ' ',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: 'like this added text',
      },
      { text: ' or to ' },
      {
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'bob',
        },
        text: 'mark text for removal',
      },
      { text: '. Discuss changes using ' },
      {
        children: [{ comment: true, comment_discussion1: true, text: 'comments' }],
        type: 'a',
        url: '/docs/comment',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' on many text segments',
      },
      { text: '. You can even have ' },
      {
        comment: true,
        comment_discussion2: true,
        suggestion: true,
        suggestion_playground3: {
          id: 'playground3',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'charlie',
        },
        text: 'overlapping',
      },
      { text: ' annotations!' },
    ],
    type: 'p',
  },
  // {
  //   children: [
  //     {
  //       text: 'Block-level suggestions are also supported for broader feedback.',
  //     },
  //   ],
  //   suggestion: {
  //     suggestionId: 'suggestionBlock1',
  //     type: 'block',
  //     userId: 'charlie',
  //   },
  //   type: 'p',
  // },
  // AI Section
  {
    children: [{ text: 'AI-Powered Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Boost your productivity with integrated ' },
      {
        children: [{ text: 'AI SDK' }],
        type: 'a',
        url: '/docs/ai',
      },
      { text: '. Press ' },
      { kbd: true, text: '⌘+J' },
      { text: ' or ' },
      { kbd: true, text: 'Space' },
      { text: ' in an empty line to:' },
    ],
    type: 'p',
  },
  {
    children: [{ text: 'Generate content (continue writing, summarize, explain)' }],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [{ text: 'Edit existing text (improve, fix grammar, change tone)' }],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  // Core Features Section (Combined)
  {
    children: [{ text: 'Rich Content Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Structure your content with ' },
      {
        children: [{ text: 'headings' }],
        type: 'a',
        url: '/docs/heading',
      },
      { text: ', ' },
      {
        children: [{ text: 'lists' }],
        type: 'a',
        url: '/docs/list',
      },
      { text: ', and ' },
      {
        children: [{ text: 'quotes' }],
        type: 'a',
        url: '/docs/blockquote',
      },
      { text: '. Apply ' },
      {
        children: [{ text: 'marks' }],
        type: 'a',
        url: '/docs/basic-marks',
      },
      { text: ' like ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'strikethrough' },
      { text: ', and ' },
      { code: true, text: 'code' },
      { text: '. Use ' },
      {
        children: [{ text: 'autoformatting' }],
        type: 'a',
        url: '/docs/autoformat',
      },
      { text: ' for ' },
      {
        children: [{ text: 'Markdown' }],
        type: 'a',
        url: '/docs/markdown',
      },
      { text: '-like shortcuts (e.g., ' },
      { kbd: true, text: '* ' },
      { text: ' for lists, ' },
      { kbd: true, text: '# ' },
      { text: ' for H1).' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Blockquotes are great for highlighting important information.',
          },
        ],
        type: 'p',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { children: [{ text: 'function hello() {' }], type: 'code_line' },
      {
        children: [{ text: "  console.info('Code blocks are supported!');" }],
        type: 'code_line',
      },
      { children: [{ text: '}' }], type: 'code_line' },
    ],
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [
      { text: 'Create ' },
      {
        children: [{ text: 'links' }],
        type: 'a',
        url: '/docs/link',
      },
      { text: ', ' },
      {
        children: [{ text: '@mention' }],
        type: 'a',
        url: '/docs/mention',
      },
      { text: ' users like ' },
      { children: [{ text: '' }], type: 'mention', value: 'Alice' },
      { text: ', or insert ' },
      {
        children: [{ text: 'emojis' }],
        type: 'a',
        url: '/docs/emoji',
      },
      { text: ' ✨. Use the ' },
      {
        children: [{ text: 'slash command' }],
        type: 'a',
        url: '/docs/slash-command',
      },
      { text: ' (/) for quick access to elements.' },
    ],
    type: 'p',
  },
  // Table Section
  {
    children: [{ text: 'How Plate Compares' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Plate offers many features out-of-the-box as free, open-source plugins.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [{ children: [{ bold: true, text: 'Feature' }], type: 'p' }],
            type: 'th',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Plate (Free & OSS)' }],
                type: 'p',
              },
            ],
            type: 'th',
          },
          {
            children: [{ children: [{ bold: true, text: 'Tiptap' }], type: 'p' }],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'AI' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Comments' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Suggestions' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid (Comments Pro)' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Emoji Picker' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Table of Contents' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Drag Handle' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Collaboration (Yjs)' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Hocuspocus (OSS/Paid)' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },
  // Media Section
  {
    children: [{ text: 'Images and Media' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Embed rich media like images directly in your content. Supports ',
      },
      {
        children: [{ text: 'Media uploads' }],
        type: 'a',
        url: '/docs/media',
      },
      {
        text: ' and ',
      },
      {
        children: [{ text: 'drag & drop' }],
        type: 'a',
        url: '/docs/dnd',
      },
      {
        text: ' for a smooth experience.',
      },
    ],
    type: 'p',
  },
  {
    attributes: { align: 'center' },
    caption: [
      {
        children: [{ text: 'Images with captions provide context.' }],
        type: 'p',
      },
    ],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '75%',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'sample.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },
  {
    children: [{ text: '' }],
    type: 'audio',
    url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  },
  {
    children: [{ text: 'Table of Contents' }],
    type: 'h3',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
];

const defaultValue = value;
