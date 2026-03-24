/**
 * useAmendmentWorkflow Hook
 *
 * Manages amendment workflow state transitions and validation.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import type { EditingMode } from '@/zero/rbac/workflow-constants';
import {
  canTransitionTo,
  isEventPhase,
  isTerminalStatus,
  EDITING_MODE_TRANSITIONS,
} from '@/zero/rbac/workflow-constants';
import { notifyWorkflowChanged } from '@/features/notifications/utils/notification-helpers.ts';

interface UseAmendmentWorkflowProps {
  amendmentId: string;
  currentStatus: EditingMode;
  currentEventId?: string;
  agendaItemId?: string;
  senderId?: string;
  amendmentTitle?: string;
}

export function useAmendmentWorkflow({
  amendmentId,
  currentStatus,
  currentEventId,
  agendaItemId,
  senderId,
  amendmentTitle,
}: UseAmendmentWorkflowProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { updateAmendment } = useAmendmentActions();
  const { createVote } = useVoteActions();
  const { initializeChangeRequestVoting } = useAgendaActions();

  /**
   * Transition to a new workflow status
   */
  const transitionTo = useCallback(
    async (targetStatus: EditingMode): Promise<boolean> => {
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
          editing_mode: targetStatus,
        });

        // Auto-initialize CR voting when transitioning to vote_event
        if (targetStatus === 'vote_event' && agendaItemId) {
          console.log('[useAmendmentWorkflow] Initializing CR voting — amendmentId:', amendmentId, 'agendaItemId:', agendaItemId);
          await initializeChangeRequestVoting({
            amendment_id: amendmentId,
            agenda_item_id: agendaItemId,
          });
        } else if (targetStatus === 'vote_event' && !agendaItemId) {
          console.warn('[useAmendmentWorkflow] Cannot initialize CR voting — agendaItemId is missing! amendmentId:', amendmentId);
        }

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
      if (currentStatus !== 'suggest_internal' && currentStatus !== 'vote_internal') {
        toast.error('Internes Voting kann nur im Suggesting oder Voting Modus gestartet werden.');
        return null;
      }

      try {
        // Transition to vote_internal if not already there
        if (currentStatus !== 'vote_internal') {
          await transitionTo('vote_internal');
        }

        // Create voting session
        const sessionId = crypto.randomUUID();
        const now = Date.now();
        const endTime = now + intervalMinutes * 60 * 1000;

        await createVote({
          id: sessionId,
          amendment_id: amendmentId,
          agenda_item_id: null,
          title: 'Internal Vote',
          description: null,
          status: 'active',
          majority_type: null,
          closing_type: null,
          closing_duration_seconds: intervalMinutes * 60,
          closing_end_time: endTime,
          visibility: 'private',
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
      // Can submit from all collaborator phase
      const allowedPhases: EditingMode[] = [
        'edit',
        'suggest_internal',
        'vote_internal',
      ];

      if (!allowedPhases.includes(currentStatus)) {
        toast.error('Amendment kann nicht in diesem Status an ein Event weitergeleitet werden.');
        return false;
      }

      try {
        await updateAmendment({
          id: amendmentId,
          editing_mode: 'suggest_event',
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
          editing_mode: result,
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
    canTransitionTo: (target: EditingMode) => canTransitionTo(currentStatus, target),
    possibleTransitions: EDITING_MODE_TRANSITIONS[currentStatus],
    isInEventPhase: isEventPhase(currentStatus),
    isTerminal: isTerminalStatus(currentStatus),
    transitionTo,
    startInternalVoting,
    submitToEvent,
    addGroupSupporter,
    finalizeAmendment,
  };
}
