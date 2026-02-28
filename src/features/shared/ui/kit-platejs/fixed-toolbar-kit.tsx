import { createPlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/features/shared/ui/ui-platejs/fixed-toolbar.tsx';
import { FixedToolbarButtons } from '@/features/shared/ui/ui-platejs/fixed-toolbar-buttons.tsx';

export const FixedToolbarKit = [
  createPlatePlugin({
    key: 'fixed-toolbar',
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
