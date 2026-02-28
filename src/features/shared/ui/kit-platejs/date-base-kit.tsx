import { BaseDatePlugin } from '@platejs/date';

import { DateElementStatic } from '@/features/shared/ui/ui-platejs/date-node-static.tsx';

export const BaseDateKit = [BaseDatePlugin.withComponent(DateElementStatic)];
