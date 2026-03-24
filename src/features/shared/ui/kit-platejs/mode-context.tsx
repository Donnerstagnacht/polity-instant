import * as React from 'react';

import type { EditorMode } from '@/features/editor/types';

interface ModeContextValue {
  currentMode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  isOwnerOrCollaborator?: boolean;
  selectedCrIds?: Set<string> | null;
  onSelectedCrIdsChange?: (crIds: Set<string> | null) => void;
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
