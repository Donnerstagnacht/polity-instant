'use client';

import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu';
import { MessageSquare, Vote, ChevronDown } from 'lucide-react';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface EditingModeSelectorProps {
  amendmentId: string;
  currentMode?: string | null;
}

const modes = [
  {
    value: 'suggest_event' as const,
    label: 'Event Suggesting',
    icon: MessageSquare,
    color: 'bg-purple-500',
  },
  {
    value: 'vote_event' as const,
    label: 'Event Voting',
    icon: Vote,
    color: 'bg-orange-500',
  },
];

export function EditingModeSelector({
  amendmentId,
  currentMode,
}: EditingModeSelectorProps) {
  const { t } = useTranslation();
  const { updateEditingMode } = useAmendmentActions();

  const currentModeConfig = modes.find(m => m.value === currentMode) ?? modes[0];
  const Icon = currentModeConfig.icon;

  const handleModeChange = async (newMode: string) => {
    if (newMode === currentMode) return;
    await updateEditingMode(amendmentId, newMode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{currentModeConfig.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSeparator />
        {modes.map(mode => {
          const ModeIcon = mode.icon;
          const isActive = mode.value === currentMode;

          return (
            <DropdownMenuItem
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={isActive ? 'bg-accent' : ''}
            >
              <div className="flex w-full items-start gap-3">
                <div
                  className={`mt-0.5 rounded p-1 text-white ${mode.color} ${isActive ? 'ring-2 ring-offset-2' : ''}`}
                >
                  <ModeIcon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{mode.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        {t('features.amendments.modeSelector.active', 'Active')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
