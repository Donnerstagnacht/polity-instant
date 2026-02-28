import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { AIToolbarButton } from './ai-toolbar-button.tsx';
import { CommentToolbarButton } from './comment-toolbar-button.tsx';
import { InlineEquationToolbarButton } from './equation-toolbar-button.tsx';
import { LinkToolbarButton } from './link-toolbar-button.tsx';
import { MarkToolbarButton } from './mark-toolbar-button.tsx';
import { MoreToolbarButton } from './more-toolbar-button.tsx';
import { SuggestionToolbarButton } from './suggestion-toolbar-button.tsx';
import { ToolbarGroup } from '@/features/shared/ui/ui/toolbar.tsx';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button.tsx';

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const { t } = useTranslation();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip={t('plateJs.toolbar.aiCommands', 'AI commands')}>
              <WandSparklesIcon />
              {t('plateJs.toolbar.askAI', 'Ask AI')}
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoToolbarButton />

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

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreToolbarButton />}
      </ToolbarGroup>
    </>
  );
}
