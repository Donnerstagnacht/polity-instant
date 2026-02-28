import { BaseMentionPlugin } from '@platejs/mention';

import { MentionElementStatic } from '@/features/shared/ui/ui-platejs/mention-node-static.tsx';

export const BaseMentionKit = [BaseMentionPlugin.withComponent(MentionElementStatic)];
