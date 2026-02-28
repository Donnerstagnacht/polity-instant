import { ListPlugin } from '@platejs/list/react';
import { KEYS } from 'platejs';

import { IndentKit } from '@/features/shared/ui/kit-platejs/indent-kit.tsx';
import { BlockList } from '@/features/shared/ui/ui-platejs/block-list.tsx';

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote, KEYS.codeBlock, KEYS.toggle],
    },
    render: {
      belowNodes: BlockList,
    },
  }),
];
