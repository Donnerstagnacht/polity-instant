import * as React from 'react';

import { useLinkToolbarButton, useLinkToolbarButtonState } from '@platejs/link/react';
import { Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function LinkToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const state = useLinkToolbarButtonState();
  const { props: buttonProps } = useLinkToolbarButton(state);
  const { t } = useTranslation();

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      data-plate-focus
      tooltip={t('plateJs.toolbar.link', 'Link')}
    >
      <Link />
    </ToolbarButton>
  );
}
