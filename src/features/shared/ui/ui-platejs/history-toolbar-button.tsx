import * as React from 'react';

import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useEditorRef, useEditorSelector } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function RedoToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const editor = useEditorRef();
  const { t } = useTranslation();
  const disabled = useEditorSelector(editor => editor.history.redos.length === 0, []);

  return (
    <ToolbarButton
      {...props}
      disabled={disabled}
      onClick={() => editor.redo()}
      onMouseDown={e => e.preventDefault()}
      tooltip={t('plateJs.toolbar.redo', 'Redo')}
    >
      <Redo2Icon />
    </ToolbarButton>
  );
}

export function UndoToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const editor = useEditorRef();
  const { t } = useTranslation();
  const disabled = useEditorSelector(editor => editor.history.undos.length === 0, []);

  return (
    <ToolbarButton
      {...props}
      disabled={disabled}
      onClick={() => editor.undo()}
      onMouseDown={e => e.preventDefault()}
      tooltip={t('plateJs.toolbar.undo', 'Undo')}
    >
      <Undo2Icon />
    </ToolbarButton>
  );
}
