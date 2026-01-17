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
import { Edit, Eye, MessageSquare, Vote, ChevronDown, Calendar, Gavel } from 'lucide-react';
import { db, tx } from '../../../../db/db';
import { toast } from 'sonner';
import type { WorkflowStatus } from '@db/rbac/workflow-constants';
import {
  WORKFLOW_STATUS_METADATA,
  isSelectableByCollaborator,
  isEventPhase,
} from '@db/rbac/workflow-constants';

type EditingMode = 'edit' | 'view' | 'suggest' | 'vote'; // Legacy types for backward compatibility

interface ModeSelectorProps {
  documentId: string;
  amendmentId?: string;
  currentMode: EditingMode;
  workflowStatus?: WorkflowStatus;
  isOwnerOrCollaborator: boolean;
  isEventParticipant?: boolean;
}

// Map legacy EditingMode to WorkflowStatus
function legacyToWorkflow(mode: EditingMode): WorkflowStatus {
  const mapping: Record<EditingMode, WorkflowStatus> = {
    edit: 'collaborative_editing',
    view: 'viewing',
    suggest: 'internal_suggesting',
    vote: 'internal_voting',
  };
  return mapping[mode] || 'viewing';
}

// Map WorkflowStatus to legacy EditingMode
function workflowToLegacy(status: WorkflowStatus): EditingMode {
  const mapping: Record<WorkflowStatus, EditingMode> = {
    collaborative_editing: 'edit',
    viewing: 'view',
    internal_suggesting: 'suggest',
    internal_voting: 'vote',
    event_suggesting: 'suggest',
    event_voting: 'vote',
    passed: 'view',
    rejected: 'view',
  };
  return mapping[status] || 'view';
}

// Get icon component from string name
function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Edit,
    Eye,
    MessageSquare,
    Vote,
    Calendar,
    Gavel,
  };
  return icons[iconName] || Eye;
}

export function ModeSelector({
  documentId,
  amendmentId,
  currentMode,
  workflowStatus,
  isOwnerOrCollaborator,
}: ModeSelectorProps) {
  // Determine effective workflow status
  const effectiveWorkflowStatus = workflowStatus || legacyToWorkflow(currentMode);
  const currentConfig = WORKFLOW_STATUS_METADATA[effectiveWorkflowStatus];
  const Icon = getIconComponent(currentConfig.icon);

  const handleModeChange = async (newStatus: WorkflowStatus) => {
    if (newStatus === effectiveWorkflowStatus) return;

    // Only allow owners/collaborators to change mode
    if (!isOwnerOrCollaborator) {
      toast.error('Only amendment collaborators can change the workflow status.');
      return;
    }

    // Prevent changing event-controlled statuses
    if (isEventPhase(newStatus)) {
      toast.error('Event-controlled statuses can only be changed by event organizers.');
      return;
    }

    // Check if status is selectable
    if (!isSelectableByCollaborator(newStatus)) {
      toast.error('This status cannot be manually selected.');
      return;
    }

    try {
      const updates: any[] = [];

      // Update document editingMode (for backward compatibility)
      const legacyMode = workflowToLegacy(newStatus);
      updates.push(
        tx.documents[documentId].update({
          editingMode: legacyMode,
          updatedAt: Date.now(),
        })
      );

      // Update amendment workflowStatus if amendmentId provided
      if (amendmentId) {
        updates.push(
          tx.amendments[amendmentId].update({
            workflowStatus: newStatus,
            updatedAt: Date.now(),
          })
        );
      }

      await db.transact(updates);

      toast.success(`Workflow geändert zu: ${currentConfig.label}`);
    } catch (error) {
      console.error('Failed to change workflow status:', error);
      toast.error('Fehler beim Ändern des Workflow-Status.');
    }
  };

  // Get available workflow statuses
  const availableStatuses = Object.entries(WORKFLOW_STATUS_METADATA)
    .filter(([status]) => {
      const wfStatus = status as WorkflowStatus;
      // Show only collaborator-selectable statuses for collaborators
      if (isOwnerOrCollaborator) {
        return isSelectableByCollaborator(wfStatus);
      }
      // For non-collaborators, only show current status
      return wfStatus === effectiveWorkflowStatus;
    })
    .map(([status, config]) => ({
      status: status as WorkflowStatus,
      ...config,
    }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-semibold">{currentConfig.label}</span>
          {isOwnerOrCollaborator && !currentConfig.readonly && (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          Workflow Status
          {!isOwnerOrCollaborator && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">(Nur Ansicht)</span>
          )}
          {isEventPhase(effectiveWorkflowStatus) && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Event-gesteuert)
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableStatuses.map(statusConfig => {
          const StatusIcon = getIconComponent(statusConfig.icon);
          const isActive = statusConfig.status === effectiveWorkflowStatus;

          return (
            <DropdownMenuItem
              key={statusConfig.status}
              onClick={() => handleModeChange(statusConfig.status)}
              className={isActive ? 'bg-accent' : ''}
              disabled={
                !isOwnerOrCollaborator ||
                statusConfig.readonly ||
                isEventPhase(effectiveWorkflowStatus)
              }
            >
              <div className="flex w-full items-start gap-3">
                <div
                  className={`mt-0.5 rounded p-1 text-white ${statusConfig.color} ${isActive ? 'ring-2 ring-offset-2' : ''}`}
                >
                  <StatusIcon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{statusConfig.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Aktiv
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{statusConfig.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
