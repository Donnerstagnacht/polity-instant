import { LinkPlugin } from '@platejs/link/react';

import { LinkElement } from '@/features/shared/ui/ui-platejs/link-node.tsx';
import { LinkFloatingToolbar } from '@/features/shared/ui/ui-platejs/link-toolbar.tsx';

export const LinkKit = [
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
