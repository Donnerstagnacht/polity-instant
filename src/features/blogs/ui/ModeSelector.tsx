'use client';

/**
 * @deprecated This component is deprecated. Use `ModeSelector` from `@/features/editor` instead.
 * Import: `import { ModeSelector } from '@/features/editor';`
 * Usage: `<ModeSelector entityType="blog" entityId={blogId} ... />`
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
import { db, tx } from '@db/db';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

type EditingMode = 'edit' | 'view' | 'suggest' | 'vote';

interface ModeSelectorProps {
  blogId: string;
  currentMode: EditingMode;
  isOwnerOrCollaborator: boolean;
}

export function ModeSelector({ blogId, currentMode, isOwnerOrCollaborator }: ModeSelectorProps) {
  const { t } = useTranslation();

  const modes = [
    {
      value: 'edit' as EditingMode,
      label: t('features.blogs.modeSelector.modes.edit.label'),
      icon: Edit,
      description: t('features.blogs.modeSelector.modes.edit.description'),
      color: 'bg-blue-500',
    },
    {
      value: 'view' as EditingMode,
      label: t('features.blogs.modeSelector.modes.view.label'),
      icon: Eye,
      description: t('features.blogs.modeSelector.modes.view.description'),
      color: 'bg-gray-500',
    },
    {
      value: 'suggest' as EditingMode,
      label: t('features.blogs.modeSelector.modes.suggest.label'),
      icon: MessageSquare,
      description: t('features.blogs.modeSelector.modes.suggest.description'),
      color: 'bg-purple-500',
    },
    {
      value: 'vote' as EditingMode,
      label: t('features.blogs.modeSelector.modes.vote.label'),
      icon: Vote,
      description: t('features.blogs.modeSelector.modes.vote.description'),
      color: 'bg-orange-500',
    },
  ];

  const currentModeConfig = modes.find(m => m.value === currentMode) || modes[0];
  const Icon = currentModeConfig.icon;

  const handleModeChange = async (newMode: EditingMode) => {
    if (newMode === currentMode) return;

    if (!isOwnerOrCollaborator) {
      toast.error(t('features.blogs.modeSelector.errors.onlyCollaborators'));
      return;
    }

    try {
      await db.transact([
        tx.blogs[blogId].update({
          editingMode: newMode,
          updatedAt: Date.now(),
        }),
      ]);

      const modeConfig = modes.find(m => m.value === newMode);
      toast.success(`${t('features.blogs.modeSelector.title')}: ${modeConfig?.label}`);
    } catch (error) {
      console.error('Failed to change mode:', error);
      toast.error(t('features.blogs.modeSelector.errors.changeFailed'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-semibold">{currentModeConfig.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t('features.blogs.modeSelector.title')}
          {!isOwnerOrCollaborator && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {t('features.blogs.modeSelector.viewOnly')}
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
                        {t('features.blogs.modeSelector.active')}
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
