import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/kit-platejs/editor-kit.tsx';
import { discussionPlugin } from '@/components/kit-platejs/discussion-kit.tsx';
import { suggestionPlugin } from '@/components/kit-platejs/suggestion-kit.tsx';
import { SettingsDialog } from '@/components/kit-platejs/settings-dialog.tsx';
import { Editor, EditorContainer } from '@/components/ui-platejs/editor.tsx';
import { SuggestionCallbacksProvider } from '@/components/kit-platejs/suggestion-callbacks-context.tsx';
import { ModeProvider } from '@/components/kit-platejs/mode-context.tsx';
import { ModeSync } from '@/components/kit-platejs/mode-sync.tsx';

interface PlateEditorProps {
  initialValue?: any[];
  value?: any[]; // Controlled mode
  onChange?: (value: any[]) => void;
  cursors?: {
    id: string;
    name: string;
    color: string;
    position: any;
  }[];
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  users?: Record<string, { id: string; name: string; avatarUrl: string }>;
  discussions?: any[]; // Discussions/comments data
  onDiscussionsChange?: (discussions: any[]) => void;
  onSuggestionAccepted?: (suggestion: any) => void;
  onSuggestionDeclined?: (suggestion: any) => void;
  onVoteAccept?: (suggestion: any) => void; // Vote accept callback
  onVoteReject?: (suggestion: any) => void; // Vote reject callback
  onVoteAbstain?: (suggestion: any) => void; // Vote abstain callback
  documentId?: string; // Document ID for suggestion ID generation
  documentTitle?: string; // Document title to show in discussions/suggestions
  currentMode?: 'edit' | 'view' | 'suggest' | 'vote'; // Current editing mode from DB
  onModeChange?: (mode: 'edit' | 'view' | 'suggest' | 'vote') => void; // Mode change callback
  isOwnerOrCollaborator?: boolean; // Whether user can change modes
}

export function PlateEditor({
  initialValue,
  value,
  onChange,
  cursors = [],
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
}: PlateEditorProps) {
  const onChangeRef = React.useRef(onChange);
  const isControlled = value !== undefined;
  const prevValueRef = React.useRef(value);

  // Update the ref when onChange changes, but don't cause re-render
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Memoize the editor configuration to prevent unnecessary re-creations
  const editorConfig = React.useMemo(() => {
    const config: any = {
      plugins: EditorKit,
      value: isControlled ? value : initialValue || defaultValue,
    };

    // Override discussion plugin options with real user data
    // IMPORTANT: Only set initial discussions, don't override on every render
    if (currentUser && users) {
      config.override = {
        plugins: {
          discussion: {
            options: {
              currentUserId: currentUser.id,
              users: users,
              discussions: discussions || [], // Initial discussions from DB
              documentTitle: documentTitle || '', // Pass document title
              documentId: documentId || '', // Pass document ID for suggestion ID generation
            },
          },
        },
      };
    }

    return config;
  }, [isControlled, value, initialValue, currentUser, users, documentTitle, documentId]); // Added documentId to deps

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
          match: (n: any) => {
            if (!n) return false;
            // Check if node has any comment_* properties
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
          match: (n: any) => {
            if (!n) return false;
            // Check if node has any suggestion_* properties or has suggestion data
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
        const cleanedDiscussions = currentDiscussions.filter((d: any) =>
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
  React.useEffect(() => {
    if (isControlled && value && prevValueRef.current !== value) {
      // Only update if there's an actual change
      const valueChanged = JSON.stringify(prevValueRef.current) !== JSON.stringify(value);
      if (valueChanged) {
        // Update the editor's children directly
        try {
          editor.children = value;
          // Force a re-render
          if (typeof editor.onChange === 'function') {
            (editor.onChange as () => void)();
          }
        } catch (e) {
          console.warn('Failed to update editor value:', e);
        }
        prevValueRef.current = value;
      }
    }
  }, [value, isControlled, editor]);

  // Handle changes from the editor using ref to avoid recreating function
  const handleEditorChange = React.useCallback(({ value: newValue }: { value: any }) => {
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

          <EditorContainer>
            <Editor variant="demo" />

            {/* Render other users' cursors */}
            {cursors.map(cursor => (
              <div
                key={cursor.id}
                className="pointer-events-none absolute z-50"
                style={
                  {
                    // Position would be calculated based on cursor.position
                    // This is a simplified version - full implementation would need
                    // to convert Slate position to DOM position
                  }
                }
              >
                <div
                  className="h-5 w-0.5 animate-pulse"
                  style={{ backgroundColor: cursor.color }}
                />
                <div
                  className="mt-1 whitespace-nowrap rounded px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name}
                </div>
              </div>
            ))}
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
