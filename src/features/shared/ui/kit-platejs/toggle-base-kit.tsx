import { BaseTogglePlugin } from '@platejs/toggle';

import { ToggleElementStatic } from '@/features/shared/ui/ui-platejs/toggle-node-static.tsx';

export const BaseToggleKit = [BaseTogglePlugin.withComponent(ToggleElementStatic)];
