import * as React from 'react';

import type { ResolvedSuggestion } from '../ui-platejs/block-suggestion';

export interface SuggestionCallbacks {
  onSuggestionAccepted?: (suggestion: ResolvedSuggestion) => void;
  onSuggestionDeclined?: (suggestion: ResolvedSuggestion) => void;
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
