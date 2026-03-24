'use client';

/**
 * Unified Mode Selector Component
 *
 * Allows switching between editing modes (edit, view, suggest, vote).
 */

import { Button } from '@/features/shared/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu';
import {
  EditingModeMenuItems,
  getEditingModeOption,
} from '@/features/shared/ui/ui/editing-mode.tsx';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { EditorEntityType, EditorMode } from '../types';

interface ModeSelectorProps {
  entityType: EditorEntityType;
  entityId: string;
  currentMode: EditorMode;
  isOwnerOrCollaborator: boolean;
  onModeChange?: (mode: EditorMode) => void;
}

export function ModeSelector({
  entityType: _entityType,
  currentMode,
  isOwnerOrCollaborator,
  onModeChange,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  const currentModeConfig = getEditingModeOption(currentMode, t);

  const handleModeChange = async (newMode: EditorMode) => {
    if (newMode === currentMode) return;

    if (!isOwnerOrCollaborator) {
      toast.error(t('features.editor.modeSelector.errors.onlyCollaborators'));
      return;
    }

    try {
      if (onModeChange) {
        onModeChange(newMode);
      }
    } catch (error) {
      console.error('Failed to change mode:', error);
      toast.error(t('features.editor.modeSelector.errors.changeFailed'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <div className={`h-2 w-2 rounded-full ${currentModeConfig.colorClass}`} />
          <currentModeConfig.Icon className="h-4 w-4" />
          <span>{currentModeConfig.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('features.editor.modeSelector.selectMode')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <EditingModeMenuItems value={currentMode} onValueChange={handleModeChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
