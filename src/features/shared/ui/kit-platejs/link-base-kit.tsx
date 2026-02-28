import { BaseLinkPlugin } from '@platejs/link';

import { LinkElementStatic } from '@/features/shared/ui/ui-platejs/link-node-static.tsx';

export const BaseLinkKit = [BaseLinkPlugin.withComponent(LinkElementStatic)];
