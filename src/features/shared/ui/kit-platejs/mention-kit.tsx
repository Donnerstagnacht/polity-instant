import { MentionInputPlugin, MentionPlugin } from '@platejs/mention/react';

import { MentionElement, MentionInputElement } from '@/features/shared/ui/ui-platejs/mention-node.tsx';

export const MentionKit = [
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }).withComponent(MentionElement),
  MentionInputPlugin.withComponent(MentionInputElement),
];
