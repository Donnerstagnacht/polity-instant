/**
 * useAmendmentWorkflow Hook
 *
 * Manages amendment workflow state transitions and validation.
 */

import { useState, useCallback } from 'react';
import db, { tx } from '../../../../db/db';
import { toast } from 'sonner';
import type { WorkflowStatus } from '@db/rbac/workflow-constants';
import {
  canTransitionTo,
  isEventPhase,
  isTerminalStatus,
  WORKFLOW_TRANSITIONS,
} from '@db/rbac/workflow-constants';
import { notifyWorkflowChanged } from '@/utils/notification-helpers';

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

  /**
   * Transition to a new workflow status
   */
  const transitionTo = useCallback(
    async (targetStatus: WorkflowStatus): Promise<boolean> => {
      if (!canTransitionTo(currentStatus, targetStatus)) {
        toast.error(
          `Ungültiger Übergang von ${currentStatus} zu ${targetStatus}`
        );
        return false;
      }

      if (isTerminalStatus(currentStatus)) {
        toast.error('Amendment ist in einem finalen Status und kann nicht geändert werden.');
        return false;
      }

      setIsTransitioning(true);

      try {
        const updates: any = {
          workflowStatus: targetStatus,
          updatedAt: Date.now(),
        };

        // Clear currentEventId if transitioning out of event phase
        if (!isEventPhase(targetStatus) && currentEventId) {
          updates.currentEventId = null;
        }

        const transactions: any[] = [tx.amendments[amendmentId].update(updates)];

        // Send notification to collaborators
        if (senderId) {
          const notificationTxs = notifyWorkflowChanged({
            senderId,
            amendmentId,
            amendmentTitle: amendmentTitle || 'Amendment',
            newStatus: targetStatus,
          });
          transactions.push(...notificationTxs);
        }

        await db.transact(transactions);

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
    async (intervalMinutes: number, autoClose: boolean = false): Promise<string | null> => {
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

        await db.transact([
          tx.amendmentVotingSessions[sessionId].update({
            amendment: amendmentId,
            votingType: 'internal',
            status: 'active',
            votingStartTime: now,
            votingEndTime: endTime,
            votingIntervalMinutes: intervalMinutes,
            currentChangeRequestIndex: 0,
            autoClose,
            createdAt: now,
            updatedAt: now,
          }),
        ]);

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
    async (eventId: string, agendaItemId?: string): Promise<boolean> => {
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
        await db.transact([
          tx.amendments[amendmentId].update({
            workflowStatus: 'event_suggesting',
            currentEventId: eventId,
            updatedAt: Date.now(),
          }),
        ]);

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
  const addGroupSupporter = useCallback(
    async (groupId: string): Promise<boolean> => {
      try {
        // Fetch current supporters
        const { data: amendment } = await db.queryOnce({
          amendments: {
            $: { where: { id: amendmentId } },
          },
        });

        const currentSupporters = amendment?.amendments?.[0]?.supporterGroups || [];
        
        if (!Array.isArray(currentSupporters)) {
          console.error('Invalid supporter groups format');
          return false;
        }

        if (currentSupporters.includes(groupId)) {
          return true; // Already a supporter
        }

        const updatedSupporters = [...currentSupporters, groupId];

        await db.transact([
          tx.amendments[amendmentId].update({
            supporterGroups: updatedSupporters,
            updatedAt: Date.now(),
          }),
        ]);

        toast.success('Gruppe als Supporter hinzugefügt');
        return true;
      } catch (error) {
        console.error('Failed to add group supporter:', error);
        toast.error('Fehler beim Hinzufügen des Supporters');
        return false;
      }
    },
    [amendmentId]
  );

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
        await db.transact([
          tx.amendments[amendmentId].update({
            workflowStatus: result,
            status: result === 'passed' ? 'Passed' : 'Rejected',
            currentEventId: null,
            updatedAt: Date.now(),
          }),
        ]);

        toast.success(
          result === 'passed'
            ? '🎉 Amendment wurde angenommen!'
            : 'Amendment wurde abgelehnt'
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
