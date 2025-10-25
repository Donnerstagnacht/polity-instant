import {
  ArrowUpToLineIcon,
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { AIToolbarButton } from './ai-toolbar-button.tsx';
import { AlignToolbarButton } from './align-toolbar-button.tsx';
import { CommentToolbarButton } from './comment-toolbar-button.tsx';
import { EmojiToolbarButton } from './emoji-toolbar-button.tsx';
import { ExportToolbarButton } from './export-toolbar-button.tsx';
import { FontColorToolbarButton } from './font-color-toolbar-button.tsx';
import { FontSizeToolbarButton } from './font-size-toolbar-button.tsx';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button.tsx';
import { ImportToolbarButton } from './import-toolbar-button.tsx';
import { IndentToolbarButton, OutdentToolbarButton } from './indent-toolbar-button.tsx';
import { InsertToolbarButton } from './insert-toolbar-button.tsx';
import { LineHeightToolbarButton } from './line-height-toolbar-button.tsx';
import { LinkToolbarButton } from './link-toolbar-button.tsx';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from './list-toolbar-button.tsx';
import { MarkToolbarButton } from './mark-toolbar-button.tsx';
import { MediaToolbarButton } from './media-toolbar-button.tsx';
import { ModeToolbarButton } from './mode-toolbar-button.tsx';
import { MoreToolbarButton } from './more-toolbar-button.tsx';
import { TableToolbarButton } from './table-toolbar-button.tsx';
import { ToggleToolbarButton } from './toggle-toolbar-button.tsx';
import { ToolbarGroup } from '../ui/toolbar.tsx';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button.tsx';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const { t } = useTranslation();

  return (
    <div className="flex w-full">
      <ToolbarGroup>
        <MarkToolbarButton
          nodeType={KEYS.highlight}
          tooltip={t('plateJs.toolbar.highlight', 'Highlight')}
        >
          <HighlighterIcon />
        </MarkToolbarButton>
        <CommentToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>

      {!readOnly && (
        <>
          <ToolbarGroup>
            <UndoToolbarButton />
            <RedoToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <AIToolbarButton tooltip={t('plateJs.toolbar.aiCommands', 'AI commands')}>
              <WandSparklesIcon />
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ExportToolbarButton>
              <ArrowUpToLineIcon />
            </ExportToolbarButton>

            <ImportToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <InsertToolbarButton />
            <TurnIntoToolbarButton />
            <FontSizeToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton
              nodeType={KEYS.bold}
              tooltip={t('plateJs.toolbar.bold', 'Bold (⌘+B)')}
            >
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.italic}
              tooltip={t('plateJs.toolbar.italic', 'Italic (⌘+I)')}
            >
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.underline}
              tooltip={t('plateJs.toolbar.underline', 'Underline (⌘+U)')}
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.strikethrough}
              tooltip={t('plateJs.toolbar.strikethrough', 'Strikethrough (⌘+⇧+M)')}
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.code}
              tooltip={t('plateJs.toolbar.code', 'Code (⌘+E)')}
            >
              <Code2Icon />
            </MarkToolbarButton>

            <FontColorToolbarButton
              nodeType={KEYS.color}
              tooltip={t('plateJs.toolbar.textColor', 'Text color')}
            >
              <BaselineIcon />
            </FontColorToolbarButton>

            <FontColorToolbarButton
              nodeType={KEYS.backgroundColor}
              tooltip={t('plateJs.toolbar.backgroundColor', 'Background color')}
            >
              <PaintBucketIcon />
            </FontColorToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignToolbarButton />

            <NumberedListToolbarButton />
            <BulletedListToolbarButton />
            <TodoListToolbarButton />
            <ToggleToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />
            <TableToolbarButton />
            <EmojiToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaToolbarButton nodeType={KEYS.img} />
            <MediaToolbarButton nodeType={KEYS.video} />
            <MediaToolbarButton nodeType={KEYS.audio} />
            <MediaToolbarButton nodeType={KEYS.file} />
          </ToolbarGroup>

          <ToolbarGroup>
            <LineHeightToolbarButton />
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MoreToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />
    </div>
  );
}
