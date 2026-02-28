import * as React from 'react';

import { insertInlineEquation } from '@platejs/math';
import { RadicalIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function InlineEquationToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const editor = useEditorRef();
  const { t } = useTranslation();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor);
      }}
      tooltip={t('plateJs.toolbar.equation', 'Mark as equation')}
    >
      <RadicalIcon />
    </ToolbarButton>
  );
}
