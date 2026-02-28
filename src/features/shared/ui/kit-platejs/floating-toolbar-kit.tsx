import { createPlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/features/shared/ui/ui-platejs/floating-toolbar.tsx';
import { FloatingToolbarButtons } from '@/features/shared/ui/ui-platejs/floating-toolbar-buttons.tsx';

export const FloatingToolbarKit = [
  createPlatePlugin({
    key: 'floating-toolbar',
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
