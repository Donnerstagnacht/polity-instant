import * as React from 'react';

interface ModeContextValue {
  currentMode?: 'edit' | 'view' | 'suggest' | 'vote';
  onModeChange?: (mode: 'edit' | 'view' | 'suggest' | 'vote') => void;
  isOwnerOrCollaborator?: boolean;
}

const ModeContext = React.createContext<ModeContextValue>({
  isOwnerOrCollaborator: true,
});

export function ModeProvider({ children, ...value }: React.PropsWithChildren<ModeContextValue>) {
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useModeContext() {
  return React.useContext(ModeContext);
}
