import { useState, useCallback } from 'react';
import { RIGHT_TYPES } from '@/features/network/ui/RightFilters';
import type { NetworkDialogEntity } from '@/features/network/ui/NetworkEntityDialog';

export function useNetworkFlowControls() {
  const [showIndirect, setShowIndirect] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<NetworkDialogEntity | null>(null);

  const toggleRight = useCallback((right: string) => {
    setSelectedRights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(right)) {
        newSet.delete(right);
      } else {
        newSet.add(right);
      }
      return newSet;
    });
  }, []);

  const handleInteractiveChange = useCallback((interactiveState: boolean) => {
    setIsInteractive(interactiveState);
    if (!interactiveState) {
      setSelectedNodes([]);
    }
  }, []);

  return {
    showIndirect,
    setShowIndirect,
    selectedNodes,
    setSelectedNodes,
    isInteractive,
    setIsInteractive,
    selectedRights,
    setSelectedRights,
    panelCollapsed,
    setPanelCollapsed,
    legendCollapsed,
    setLegendCollapsed,
    dialogOpen,
    setDialogOpen,
    selectedEntity,
    setSelectedEntity,
    toggleRight,
    handleInteractiveChange,
  };
}
