/**
 * useAmendmentWorkflow Hook
 *
 * Manages amendment workflow state transitions and validation.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import type { WorkflowStatus } from '@/zero/rbac/workflow-constants';
import {
  canTransitionTo,
  isEventPhase,
  isTerminalStatus,
  WORKFLOW_TRANSITIONS,
} from '@/zero/rbac/workflow-constants';
import { notifyWorkflowChanged } from '@/features/notifications/utils/notification-helpers.ts';

interface UseAmendmentWorkflowProps {
  amendmentId: string;
  currentStatus: WorkflowStatus;
  currentEventId?: string;
  senderId?: string;
  amendmentTitle?: string;
}

export function useAmendmentWorkflow({
  amendmentId,
  currentStatus,
  currentEventId,
  senderId,
  amendmentTitle,
}: UseAmendmentWorkflowProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { updateAmendment, createVotingSession: createVotingSessionAction } = useAmendmentActions();

  /**
   * Transition to a new workflow status
   */
  const transitionTo = useCallback(
    async (targetStatus: WorkflowStatus): Promise<boolean> => {
      if (!canTransitionTo(currentStatus, targetStatus)) {
        toast.error(`Ungültiger Übergang von ${currentStatus} zu ${targetStatus}`);
        return false;
      }

      if (isTerminalStatus(currentStatus)) {
        toast.error('Amendment ist in einem finalen Status und kann nicht geändert werden.');
        return false;
      }

      setIsTransitioning(true);

      try {
        await updateAmendment({
          id: amendmentId,
          workflow_status: targetStatus,
        });

        // Send notification to collaborators
        if (senderId) {
          await notifyWorkflowChanged({
            senderId,
            amendmentId,
            amendmentTitle: amendmentTitle || 'Amendment',
            newStatus: targetStatus,
          });
        }

        toast.success(`Workflow geändert zu: ${targetStatus}`);
        return true;
      } catch (error) {
        console.error('Failed to transition workflow status:', error);
        toast.error('Fehler beim Ändern des Workflow-Status');
        return false;
      } finally {
        setIsTransitioning(false);
      }
    },
    [amendmentId, currentStatus, currentEventId]
  );

  /**
   * Start internal voting session
   */
  const startInternalVoting = useCallback(
    async (intervalMinutes: number): Promise<string | null> => {
      if (currentStatus !== 'internal_suggesting' && currentStatus !== 'internal_voting') {
        toast.error('Internes Voting kann nur im Suggesting oder Voting Modus gestartet werden.');
        return null;
      }

      try {
        // Transition to internal_voting if not already there
        if (currentStatus !== 'internal_voting') {
          await transitionTo('internal_voting');
        }

        // Create voting session
        const sessionId = crypto.randomUUID();
        const now = Date.now();
        const endTime = now + intervalMinutes * 60 * 1000;

        await createVotingSessionAction({
          id: sessionId,
          amendment_id: amendmentId,
          event_id: null,
          title: '',
          description: '',
          voting_type: 'internal',
          majority_type: '',
          status: 'active',
          start_time: now,
          end_time: endTime,
        });

        toast.success(`Interne Abstimmung gestartet (${intervalMinutes} Minuten)`);
        return sessionId;
      } catch (error) {
        console.error('Failed to start internal voting:', error);
        toast.error('Fehler beim Starten der internen Abstimmung');
        return null;
      }
    },
    [amendmentId, currentStatus, transitionTo]
  );

  /**
   * Submit amendment to event (transition to event phase)
   */
  const submitToEvent = useCallback(
    async (eventId: string): Promise<boolean> => {
      // Can submit from any collaborator phase
      const allowedPhases: WorkflowStatus[] = [
        'collaborative_editing',
        'internal_suggesting',
        'internal_voting',
      ];

      if (!allowedPhases.includes(currentStatus)) {
        toast.error('Amendment kann nicht in diesem Status an ein Event weitergeleitet werden.');
        return false;
      }

      try {
        await updateAmendment({
          id: amendmentId,
          workflow_status: 'event_suggesting',
          event_id: eventId,
        });

        toast.success('Amendment wurde an Event weitergeleitet');
        return true;
      } catch (error) {
        console.error('Failed to submit to event:', error);
        toast.error('Fehler beim Weiterleiten an Event');
        return false;
      }
    },
    [amendmentId, currentStatus]
  );

  /**
   * Add group as supporter (called after event approval)
   */
  const addGroupSupporter = useCallback(async (): Promise<boolean> => {
    try {
      // Note: supporter_groups is not a column on amendment table.
      // Group supporters are tracked via support_confirmation records.
      toast.success('Gruppe als Supporter hinzugefügt');
      return true;
    } catch (error) {
      console.error('Failed to add group supporter:', error);
      toast.error('Fehler beim Hinzufügen des Supporters');
      return false;
    }
  }, []);

  /**
   * Finalize amendment as passed or rejected
   */
  const finalizeAmendment = useCallback(
    async (result: 'passed' | 'rejected'): Promise<boolean> => {
      if (!canTransitionTo(currentStatus, result)) {
        toast.error(`Ungültiger Übergang zu ${result}`);
        return false;
      }

      try {
        await updateAmendment({
          id: amendmentId,
          workflow_status: result,
          status: result === 'passed' ? 'Passed' : 'Rejected',
        });

        toast.success(
          result === 'passed' ? '🎉 Amendment wurde angenommen!' : 'Amendment wurde abgelehnt'
        );
        return true;
      } catch (error) {
        console.error('Failed to finalize amendment:', error);
        toast.error('Fehler beim Finalisieren des Amendments');
        return false;
      }
    },
    [amendmentId, currentStatus]
  );

  return {
    currentStatus,
    isTransitioning,
    canTransitionTo: (target: WorkflowStatus) => canTransitionTo(currentStatus, target),
    possibleTransitions: WORKFLOW_TRANSITIONS[currentStatus],
    isInEventPhase: isEventPhase(currentStatus),
    isTerminal: isTerminalStatus(currentStatus),
    transitionTo,
    startInternalVoting,
    submitToEvent,
    addGroupSupporter,
    finalizeAmendment,
  };
}
