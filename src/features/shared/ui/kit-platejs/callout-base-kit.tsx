import { BaseCalloutPlugin } from '@platejs/callout';

import { CalloutElementStatic } from '@/features/shared/ui/ui-platejs/callout-node-static.tsx';

export const BaseCalloutKit = [BaseCalloutPlugin.withComponent(CalloutElementStatic)];
