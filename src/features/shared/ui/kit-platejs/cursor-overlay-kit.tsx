import { CursorOverlayPlugin } from '@platejs/selection/react';

import { CursorOverlay } from '@/features/shared/ui/ui-platejs/cursor-overlay.tsx';

export const CursorOverlayKit = [
  CursorOverlayPlugin.configure({
    render: {
      afterEditable: () => <CursorOverlay />,
    },
  }),
];
