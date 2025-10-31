import * as React from 'react';

export interface SuggestionCallbacks {
  onSuggestionAccepted?: (suggestion: any) => void;
  onSuggestionDeclined?: (suggestion: any) => void;
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
