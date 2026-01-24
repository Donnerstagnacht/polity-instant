'use client';

/**
 * Unified Mode Selector Component
 *
 * Allows switching between editing modes (edit, view, suggest, vote).
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, MessageSquare, Vote, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { updateEntityMode } from '../utils/version-utils';
import type { EditorEntityType, EditorMode } from '../types';

interface ModeSelectorProps {
  entityType: EditorEntityType;
  entityId: string;
  currentMode: EditorMode;
  isOwnerOrCollaborator: boolean;
  onModeChange?: (mode: EditorMode) => void;
}

export function ModeSelector({
  entityType,
  entityId,
  currentMode,
  isOwnerOrCollaborator,
  onModeChange,
}: ModeSelectorProps) {
  const { t } = useTranslation();

  // Define available modes based on entity type
  const modes = [
    {
      value: 'edit' as EditorMode,
      label: t('features.editor.modeSelector.modes.edit.label'),
      icon: Edit,
      description: t('features.editor.modeSelector.modes.edit.description'),
      color: 'bg-blue-500',
    },
    {
      value: 'view' as EditorMode,
      label: t('features.editor.modeSelector.modes.view.label'),
      icon: Eye,
      description: t('features.editor.modeSelector.modes.view.description'),
      color: 'bg-gray-500',
    },
    {
      value: 'suggest' as EditorMode,
      label: t('features.editor.modeSelector.modes.suggest.label'),
      icon: MessageSquare,
      description: t('features.editor.modeSelector.modes.suggest.description'),
      color: 'bg-purple-500',
    },
    {
      value: 'vote' as EditorMode,
      label: t('features.editor.modeSelector.modes.vote.label'),
      icon: Vote,
      description: t('features.editor.modeSelector.modes.vote.description'),
      color: 'bg-orange-500',
    },
  ];

  // Filter modes based on entity type (blogs don't have vote mode in some cases)
  const availableModes = entityType === 'blog' ? modes : modes;

  const currentModeConfig = modes.find(m => m.value === currentMode) || modes[0];
  const Icon = currentModeConfig.icon;

  const handleModeChange = async (newMode: EditorMode) => {
    if (newMode === currentMode) return;

    if (!isOwnerOrCollaborator) {
      toast.error(t('features.editor.modeSelector.errors.onlyCollaborators'));
      return;
    }

    try {
      await updateEntityMode(entityType, entityId, newMode);

      const modeConfig = modes.find(m => m.value === newMode);
      toast.success(`${t('features.editor.modeSelector.title')}: ${modeConfig?.label}`);

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
          <div className={`h-2 w-2 rounded-full ${currentModeConfig.color}`} />
          <Icon className="h-4 w-4" />
          {t('features.editor.modeSelector.title')}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('features.editor.modeSelector.selectMode')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableModes.map(mode => {
          const ModeIcon = mode.icon;
          const isActive = mode.value === currentMode;

          return (
            <DropdownMenuItem
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className="flex cursor-pointer items-center gap-2"
            >
              <div className={`h-2 w-2 rounded-full ${mode.color}`} />
              <ModeIcon className="h-4 w-4" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{mode.label}</span>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      {t('features.editor.modeSelector.active')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{mode.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
