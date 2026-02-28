import { TogglePlugin } from '@platejs/toggle/react';

import { IndentKit } from '@/features/shared/ui/kit-platejs/indent-kit.tsx';
import { ToggleElement } from '@/features/shared/ui/ui-platejs/toggle-node.tsx';

export const ToggleKit = [...IndentKit, TogglePlugin.withComponent(ToggleElement)];
