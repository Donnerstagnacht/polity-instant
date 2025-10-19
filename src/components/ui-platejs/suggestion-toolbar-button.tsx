import { SuggestionPlugin } from '@platejs/suggestion/react';
import { PencilLineIcon } from 'lucide-react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/utils.ts';

import { ToolbarButton } from '../ui/toolbar.tsx';

export function SuggestionToolbarButton() {
  const { setOption } = useEditorPlugin(SuggestionPlugin);
  const isSuggesting = usePluginOption(SuggestionPlugin, 'isSuggesting');
  const { t } = useTranslation();

  return (
    <ToolbarButton
      className={cn(isSuggesting && 'text-brand/80 hover:text-brand/80')}
      onClick={() => setOption('isSuggesting', !isSuggesting)}
      onMouseDown={e => e.preventDefault()}
      tooltip={
        isSuggesting
          ? t('plateJs.toolbar.turnOffSuggesting', 'Turn off suggesting')
          : t('plateJs.toolbar.suggestionEdits', 'Suggestion edits')
      }
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
