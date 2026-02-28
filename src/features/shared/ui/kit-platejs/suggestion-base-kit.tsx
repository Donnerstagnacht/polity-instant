import { BaseSuggestionPlugin } from '@platejs/suggestion';

import { SuggestionLeafStatic } from '@/features/shared/ui/ui-platejs/suggestion-node-static.tsx';

export const BaseSuggestionKit = [BaseSuggestionPlugin.withComponent(SuggestionLeafStatic)];
