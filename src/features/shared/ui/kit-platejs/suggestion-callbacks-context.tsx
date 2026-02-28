import * as React from 'react';

import type { ResolvedSuggestion } from '@/features/shared/ui/ui-platejs/block-suggestion.tsx';

export interface SuggestionCallbacks {
  onSuggestionAccepted?: (suggestion: ResolvedSuggestion) => void;
  onSuggestionDeclined?: (suggestion: ResolvedSuggestion) => void;
  onVoteAccept?: (suggestion: ResolvedSuggestion) => void;
  onVoteReject?: (suggestion: ResolvedSuggestion) => void;
  onVoteAbstain?: (suggestion: ResolvedSuggestion) => void;
}

const SuggestionCallbacksContext = React.createContext<SuggestionCallbacks>({});

export function SuggestionCallbacksProvider({
  children,
  callbacks,
}: {
  children: React.ReactNode;
  callbacks: SuggestionCallbacks;
}) {
  return (
    <SuggestionCallbacksContext.Provider value={callbacks}>
      {children}
    </SuggestionCallbacksContext.Provider>
  );
}

export function useSuggestionCallbacks() {
  return React.useContext(SuggestionCallbacksContext);
}
