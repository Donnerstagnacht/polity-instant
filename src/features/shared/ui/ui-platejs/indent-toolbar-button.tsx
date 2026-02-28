import * as React from 'react';

import { useIndentButton, useOutdentButton } from '@platejs/indent/react';
import { IndentIcon, OutdentIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function IndentToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const { props: buttonProps } = useIndentButton();
  const { t } = useTranslation();

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      tooltip={t('plateJs.toolbar.indent', 'Increase indent')}
    >
      <IndentIcon />
    </ToolbarButton>
  );
}

export function OutdentToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const { props: buttonProps } = useOutdentButton();
  const { t } = useTranslation();

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      tooltip={t('plateJs.toolbar.outdent', 'Decrease indent')}
    >
      <OutdentIcon />
    </ToolbarButton>
  );
}
