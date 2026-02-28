import { TocPlugin } from '@platejs/toc/react';
import { TocElement } from '@/features/shared/ui/ui-platejs/toc-node.tsx';

export const TocKit = [
  TocPlugin.configure({
    options: {
      // isScroll: true,
      topOffset: 80,
    },
  }).withComponent(TocElement),
];
