import * as React from 'react';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type DropdownMenuProps, DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import { CheckIcon, EyeIcon, PencilLineIcon, PenIcon, Vote } from 'lucide-react';
import { useEditorRef, usePlateState, usePluginOption } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

import { ToolbarButton } from '../ui/toolbar.tsx';

interface ModeToolbarButtonProps extends DropdownMenuProps {
  currentMode?: 'edit' | 'view' | 'suggest' | 'vote';
  onModeChange?: (mode: 'edit' | 'view' | 'suggest' | 'vote') => void;
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

  // Determine current mode based on either external prop or internal state
  let value = 'editing';

  if (currentMode) {
    // Use external mode from database
    if (currentMode === 'edit') value = 'editing';
    if (currentMode === 'view') value = 'viewing';
    if (currentMode === 'suggest') value = 'suggestion';
    if (currentMode === 'vote') value = 'voting';
  } else {
    // Use internal PlateJS state
    if (readOnly) value = 'viewing';
    if (isSuggesting) value = 'suggestion';
  }

  const item: Record<string, { icon: React.ReactNode; label: string }> = {
    editing: {
      icon: <PenIcon />,
      label: t('plateJs.toolbar.mode.editing', 'Editing'),
    },
    suggestion: {
      icon: <PencilLineIcon />,
      label: t('plateJs.toolbar.mode.suggestion', 'Suggestion'),
    },
    viewing: {
      icon: <EyeIcon />,
      label: t('plateJs.toolbar.mode.viewing', 'Viewing'),
    },
    voting: {
      icon: <Vote />,
      label: t('plateJs.toolbar.mode.voting', 'Voting'),
    },
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={open}
          tooltip={t('plateJs.toolbar.editingMode', 'Editing mode')}
          isDropdown
        >
          {item[value].icon}
          <span className="hidden lg:inline">{item[value].label}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[180px]" align="start">
        {!isOwnerOrCollaborator && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('plateJs.toolbar.mode.viewOnly', 'View only - contact owner to change mode')}
          </div>
        )}
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={newValue => {
            // If external mode handler is provided, use it (synced with DB)
            if (onModeChange) {
              const modeMap: Record<string, 'edit' | 'view' | 'suggest' | 'vote'> = {
                editing: 'edit',
                viewing: 'view',
                suggestion: 'suggest',
                voting: 'vote',
              };
              onModeChange(modeMap[newValue]);
              return;
            }

            // Otherwise, use internal PlateJS state management
            if (newValue === 'viewing' || newValue === 'voting') {
              setReadOnly(true);
            } else {
              setReadOnly(false);
            }

            if (newValue === 'suggestion') {
              editor.setOption(SuggestionPlugin, 'isSuggesting', true);
            } else {
              editor.setOption(SuggestionPlugin, 'isSuggesting', false);
            }

            if (newValue === 'editing') {
              editor.tf.focus();
            }
          }}
        >
          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground *:first:[span]:hidden pl-2"
            value="editing"
            disabled={!isOwnerOrCollaborator}
          >
            <Indicator />
            {item.editing.icon}
            {item.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground *:first:[span]:hidden pl-2"
            value="viewing"
            disabled={!isOwnerOrCollaborator}
          >
            <Indicator />
            {item.viewing.icon}
            {item.viewing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground *:first:[span]:hidden pl-2"
            value="suggestion"
            disabled={!isOwnerOrCollaborator}
          >
            <Indicator />
            {item.suggestion.icon}
            {item.suggestion.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground *:first:[span]:hidden pl-2"
            value="voting"
            disabled={!isOwnerOrCollaborator}
          >
            <Indicator />
            {item.voting.icon}
            {item.voting.label}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Indicator() {
  return (
    <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <CheckIcon />
      </DropdownMenuItemIndicator>
    </span>
  );
}
