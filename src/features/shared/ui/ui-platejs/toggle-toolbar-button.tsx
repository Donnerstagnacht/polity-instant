import * as React from 'react';

import { useToggleToolbarButton, useToggleToolbarButtonState } from '@platejs/toggle/react';
import { ListCollapseIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function ToggleToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const state = useToggleToolbarButtonState();
  const { props: buttonProps } = useToggleToolbarButton(state);
  const { t } = useTranslation();

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      tooltip={t('plateJs.toolbar.toggleList', 'Toggle list')}
    >
      <ListCollapseIcon />
    </ToolbarButton>
  );
}
