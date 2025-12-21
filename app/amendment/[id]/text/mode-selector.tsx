'use client';

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

type EditingMode = 'edit' | 'view' | 'suggest' | 'vote';

interface ModeSelectorProps {
  documentId: string;
  currentMode: EditingMode;
  isOwnerOrCollaborator: boolean;
}

const modes = [
  {
    value: 'edit' as EditingMode,
    label: 'Edit',
    icon: Edit,
    description: 'Direct editing enabled',
    color: 'bg-blue-500',
  },
  {
    value: 'view' as EditingMode,
    label: 'View',
    icon: Eye,
    description: 'Read-only mode',
    color: 'bg-gray-500',
  },
  {
    value: 'suggest' as EditingMode,
    label: 'Suggest',
    icon: MessageSquare,
    description: 'Changes require review',
    color: 'bg-purple-500',
  },
  {
    value: 'vote' as EditingMode,
    label: 'Vote',
    icon: Vote,
    description: 'Changes require voting',
    color: 'bg-orange-500',
  },
];

export function ModeSelector({
  documentId,
  currentMode,
  isOwnerOrCollaborator,
}: ModeSelectorProps) {
  const currentModeConfig = modes.find(m => m.value === currentMode) || modes[0];
  const Icon = currentModeConfig.icon;

  const handleModeChange = async (newMode: EditingMode) => {
    if (newMode === currentMode) return;

    // Only allow owners/collaborators to change mode
    if (!isOwnerOrCollaborator) {
      toast.error('Only document owners and collaborators can change the editing mode.');
      return;
    }

    try {
      await db.transact([
        tx.documents[documentId].update({
          editingMode: newMode,
          updatedAt: Date.now(),
        }),
      ]);

      toast.success(`Document is now in ${newMode} mode.`);
    } catch (error) {
      console.error('Failed to change mode:', error);
      toast.error('Failed to change document mode.');
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
          Document Mode
          {!isOwnerOrCollaborator && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">(View only)</span>
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
                        Active
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
