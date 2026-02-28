import * as React from 'react';
import { usePlateState } from 'platejs/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { useEditorPlugin } from 'platejs/react';

interface ModeSyncProps {
  currentMode?: 'edit' | 'view' | 'suggest' | 'vote';
}

/**
 * Component that syncs the external mode with PlateJS internal state.
 * Must be rendered inside <Plate> component.
 */
export function ModeSync({ currentMode }: ModeSyncProps) {
  const [, setReadOnly] = usePlateState('readOnly');
  const { setOption } = useEditorPlugin(SuggestionPlugin);

  React.useEffect(() => {
    if (!currentMode) return;

    // Set readonly based on mode
    const shouldBeReadOnly = currentMode === 'view' || currentMode === 'vote';
    setReadOnly(shouldBeReadOnly);

    // Set suggesting based on mode
    const shouldBeSuggesting = currentMode === 'suggest';
    setOption('isSuggesting', shouldBeSuggesting);
  }, [currentMode, setReadOnly, setOption]);

  return null; // This component doesn't render anything
}
