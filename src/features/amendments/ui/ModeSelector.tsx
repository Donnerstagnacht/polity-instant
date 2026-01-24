'use client';

/**
 * @deprecated This component is deprecated. Use `ModeSelector` from `@/features/editor` instead.
 * Import: `import { ModeSelector } from '@/features/editor';`
 * Usage: `<ModeSelector entityType="amendment" entityId={documentId} ... />`
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
import { db, tx } from '../../../../db/db';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

type EditingMode = 'edit' | 'view' | 'suggest' | 'vote';

interface ModeSelectorProps {
  documentId: string;
  currentMode: EditingMode;
  isOwnerOrCollaborator: boolean;
}

export function ModeSelector({
  documentId,
  currentMode,
  isOwnerOrCollaborator,
}: ModeSelectorProps) {
  const { t } = useTranslation();

  const modes = [
    {
      value: 'edit' as EditingMode,
      label: t('features.amendments.workflow.collaborativeEditing'),
      icon: Edit,
      description: t('features.amendments.modeSelector.active'),
      color: 'bg-blue-500',
    },
    {
      value: 'view' as EditingMode,
      label: t('features.amendments.workflow.viewing'),
      icon: Eye,
      description: t('features.amendments.modeSelector.viewOnly'),
      color: 'bg-gray-500',
    },
    {
      value: 'suggest' as EditingMode,
      label: t('features.amendments.workflow.internalSuggesting'),
      icon: MessageSquare,
      description: t('features.amendments.modeSelector.active'),
      color: 'bg-purple-500',
    },
    {
      value: 'vote' as EditingMode,
      label: t('features.amendments.workflow.internalVoting'),
      icon: Vote,
      description: t('features.amendments.modeSelector.active'),
      color: 'bg-orange-500',
    },
  ];

  const currentModeConfig = modes.find(m => m.value === currentMode) || modes[0];
  const Icon = currentModeConfig.icon;

  const handleModeChange = async (newMode: EditingMode) => {
    if (newMode === currentMode) return;

    if (!isOwnerOrCollaborator) {
      toast.error(t('features.amendments.modeSelector.errors.onlyCollaborators'));
      return;
    }

    try {
      await db.transact([
        tx.documents[documentId].update({
          editingMode: newMode,
          updatedAt: Date.now(),
        }),
      ]);

      const modeConfig = modes.find(m => m.value === newMode);
      toast.success(`${t('features.amendments.modeSelector.title')}: ${modeConfig?.label}`);
    } catch (error) {
      console.error('Failed to change mode:', error);
      toast.error(t('features.amendments.modeSelector.errors.changeFailed'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-semibold">{currentModeConfig.label} Mode</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t('features.amendments.modeSelector.title')}
          {!isOwnerOrCollaborator && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {t('features.amendments.modeSelector.viewOnly')}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {modes.map(mode => {
          const ModeIcon = mode.icon;
          const isActive = mode.value === currentMode;

          return (
            <DropdownMenuItem
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={isActive ? 'bg-accent' : ''}
              disabled={!isOwnerOrCollaborator && !isActive}
            >
              <div className="flex w-full items-start gap-3">
                <div
                  className={`mt-0.5 rounded p-1 text-white ${mode.color} ${isActive ? 'ring-2 ring-offset-2' : ''}`}
                >
                  <ModeIcon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{mode.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        {t('features.amendments.modeSelector.active')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
