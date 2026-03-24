import * as React from 'react';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { useEditorRef, usePlateState, usePluginOption } from 'platejs/react';

import type { EditorMode } from '@/features/editor/types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu.tsx';
import {
  EditingModeMenuItems,
  getEditingModeOption,
  type SelectableEditingMode,
} from '@/features/shared/ui/ui/editing-mode.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

interface ModeToolbarButtonProps extends DropdownMenuProps {
  currentMode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  isOwnerOrCollaborator?: boolean;
}

export function ModeToolbarButton({
  currentMode,
  onModeChange,
  isOwnerOrCollaborator = true,
  ...props
}: ModeToolbarButtonProps) {
  const editor = useEditorRef();
  const [readOnly, setReadOnly] = usePlateState('readOnly');
  const [open, setOpen] = React.useState(false);

  const isSuggesting = usePluginOption(SuggestionPlugin, 'isSuggesting');

  const { t } = useTranslation();

  const syncedMode = React.useMemo<SelectableEditingMode>(() => {
    if (currentMode) {
      return currentMode;
    }

    if (readOnly) return 'view';
    if (isSuggesting) return 'suggest_internal';

    return 'edit';
  }, [currentMode, isSuggesting, readOnly]);

  const [mode, setMode] = React.useState<SelectableEditingMode>(syncedMode);

  React.useEffect(() => {
    setMode(syncedMode);
  }, [syncedMode]);

  const currentOption = getEditingModeOption(mode, t);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          key={mode}
          pressed={open}
          tooltip={t('plateJs.toolbar.editingMode', 'Editing mode')}
          isDropdown
        >
          <currentOption.Icon />
          <span className="hidden lg:inline">{currentOption.label}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="start">
        {!isOwnerOrCollaborator && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('plateJs.toolbar.mode.viewOnly', 'View only - contact owner to change mode')}
          </div>
        )}
        <EditingModeMenuItems
          value={mode}
          disabled={!isOwnerOrCollaborator}
          onValueChange={nextMode => {
            setMode(nextMode);

            if (onModeChange) {
              onModeChange(nextMode);
              return;
            }

            setReadOnly(
              nextMode === 'view' || nextMode === 'vote_internal' || nextMode === 'vote_event'
            );
            editor.setOption(
              SuggestionPlugin,
              'isSuggesting',
              nextMode === 'suggest_internal' || nextMode === 'suggest_event'
            );

            if (nextMode === 'edit') {
              editor.tf.focus();
            }
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
