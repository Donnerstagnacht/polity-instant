import { BaseTocPlugin } from '@platejs/toc';
import { TocElementStatic } from '@/features/shared/ui/ui-platejs/toc-node-static.tsx';

export const BaseTocKit = [BaseTocPlugin.withComponent(TocElementStatic)];
