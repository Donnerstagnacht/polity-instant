import { type Value, TrailingBlockPlugin } from 'platejs';
import { type TPlateEditor, useEditorRef } from 'platejs/react';

import { AIKit } from '@/features/shared/ui/kit-platejs/ai-kit.tsx';
import { AlignKit } from '@/features/shared/ui/kit-platejs/align-kit.tsx';
import { AutoformatKit } from '@/features/shared/ui/kit-platejs/autoformat-kit.tsx';
import { BasicBlocksKit } from '@/features/shared/ui/kit-platejs/basic-blocks-kit.tsx';
import { BasicMarksKit } from '@/features/shared/ui/kit-platejs/basic-marks-kit.tsx';
import { BlockMenuKit } from '@/features/shared/ui/kit-platejs/block-menu-kit.tsx';
import { BlockPlaceholderKit } from '@/features/shared/ui/kit-platejs/block-placeholder-kit.tsx';
import { CalloutKit } from '@/features/shared/ui/kit-platejs/callout-kit.tsx';
import { CodeBlockKit } from '@/features/shared/ui/kit-platejs/code-block-kit.tsx';
import { ColumnKit } from '@/features/shared/ui/kit-platejs/column-kit.tsx';
import { CommentKit } from '@/features/shared/ui/kit-platejs/comment-kit.tsx';
import { CopilotKit } from '@/features/shared/ui/kit-platejs/copilot-kit.tsx';
import { CursorOverlayKit } from '@/features/shared/ui/kit-platejs/cursor-overlay-kit.tsx';
import { DateKit } from '@/features/shared/ui/kit-platejs/date-kit.tsx';
import { DiscussionKit } from '@/features/shared/ui/kit-platejs/discussion-kit.tsx';
import { DndKit } from '@/features/shared/ui/kit-platejs/dnd-kit.tsx';
import { DocxKit } from '@/features/shared/ui/kit-platejs/docx-kit.tsx';
import { EmojiKit } from '@/features/shared/ui/kit-platejs/emoji-kit.tsx';
import { ExitBreakKit } from '@/features/shared/ui/kit-platejs/exit-break-kit.tsx';
import { FixedToolbarKit } from '@/features/shared/ui/kit-platejs/fixed-toolbar-kit.tsx';
import { FloatingToolbarKit } from '@/features/shared/ui/kit-platejs/floating-toolbar-kit.tsx';
import { FontKit } from '@/features/shared/ui/kit-platejs/font-kit.tsx';
import { LineHeightKit } from '@/features/shared/ui/kit-platejs/line-height-kit.tsx';
import { LinkKit } from '@/features/shared/ui/kit-platejs/link-kit.tsx';
import { ListKit } from '@/features/shared/ui/kit-platejs/list-kit.tsx';
import { MarkdownKit } from '@/features/shared/ui/kit-platejs/markdown-kit.tsx';
import { MathKit } from '@/features/shared/ui/kit-platejs/math-kit.tsx';
import { MediaKit } from '@/features/shared/ui/kit-platejs/media-kit.tsx';
import { MentionKit } from '@/features/shared/ui/kit-platejs/mention-kit.tsx';
import { SlashKit } from '@/features/shared/ui/kit-platejs/slash-kit.tsx';
import { SuggestionKit } from '@/features/shared/ui/kit-platejs/suggestion-kit.tsx';
import { TableKit } from '@/features/shared/ui/kit-platejs/table-kit.tsx';
import { TocKit } from '@/features/shared/ui/kit-platejs/toc-kit.tsx';
import { ToggleKit } from '@/features/shared/ui/kit-platejs/toggle-kit.tsx';

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
