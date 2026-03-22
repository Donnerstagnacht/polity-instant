import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { useEventWikiData } from '@/zero/events/useEventState';
import { useUserState } from '@/zero/users';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useElectionActions } from '@/zero/elections/useElectionActions';
import { useSubscribeEvent } from './useSubscribeEvent';
import { useEventParticipation } from './useEventParticipation';
import { computeAgendaStats } from '@/features/agendas/logic/computeAgendaStats';
import { notifyCandidateAdded } from '@/features/notifications/utils/notification-helpers.ts';

export function useEventWikiPage(eventId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [electionsDialogOpen, setElectionsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);

  const { addCandidate } = useElectionActions();

  const subscribeData = useSubscribeEvent(eventId);
  const participationData = useEventParticipation(eventId);

  const { event, agendaItems: agendaItemRows } = useEventWikiData(eventId);
  const { allUsers } = useUserState({ includeAllUsers: true });

  const currentUserProfile = user
    ? (allUsers || []).find((u) => u.id === user.id)
    : null;

  // Calculate agenda statistics
  const agendaItems = useMemo(
    () => (agendaItemRows || []).filter((item) => item.event?.id === eventId),
    [agendaItemRows, eventId],
  );

  const agendaStats = useMemo(() => computeAgendaStats(agendaItems), [agendaItems]);

  // Get elections for this event (flatten the one-to-many relation)
  const elections = useMemo(
    () => agendaItems.flatMap((item) => item.election ?? []),
    [agendaItems],
  );

  type ElectionItem = (typeof elections)[number];

  const [selectedElection, setSelectedElection] = useState<ElectionItem | null>(null);

  const getUserCandidacy = useCallback(
    (election: ElectionItem) => election.candidates?.find((c) => c.user?.id === user?.id),
    [user?.id],
  );

  const handleElectionClick = useCallback(
    (election: ElectionItem) => {
      setSelectedElection(election);
      setElectionsDialogOpen(false);
      setConfirmDialogOpen(true);
    },
    [],
  );

  const handleConfirmCandidacy = useCallback(async () => {
    if (!user || !selectedElection) return;

    setIsSubmitting(true);
    try {
      const existingCandidacy = getUserCandidacy(selectedElection);
      if (existingCandidacy) {
        toast.error('Sie sind bereits Kandidat für diese Wahl');
        setConfirmDialogOpen(false);
        setIsSubmitting(false);
        return;
      }

      const candidateId = crypto.randomUUID();
      const maxOrder = Math.max(
        0,
        ...(selectedElection.candidates || []).map((c) => c.order_index || 0),
      );

      const candidateName = currentUserProfile?.first_name || user.email || 'Unbenannt';

      await addCandidate({
        id: candidateId,
        name: candidateName,
        description: '',
        image_url: currentUserProfile?.avatar || '',
        order_index: maxOrder + 1,
        election_id: selectedElection.id as string,
        user_id: user.id,
        status: 'nominated',
      });

      await notifyCandidateAdded({
        senderId: user.id,
        eventId,
        eventTitle: event?.title || 'Event',
        candidateName,
      });

      toast.success('Sie wurden erfolgreich als Kandidat hinzugefügt!');
      setConfirmDialogOpen(false);
      setSelectedElection(null);
    } catch (error) {
      console.error('Failed to add candidate:', error);
      toast.error('Fehler beim Hinzufügen des Kandidaten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, selectedElection, currentUserProfile, getUserCandidacy, addCandidate, eventId, event?.title]);

  return {
    navigate,
    user,

    // Subscribe
    ...subscribeData,

    // Participation
    participation: participationData,

    // Event data
    event,
    agendaItems,
    agendaStats,
    elections,

    // Dialog state
    electionsDialogOpen,
    setElectionsDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen,
    selectedElection,
    isSubmitting,
    participantsDialogOpen,
    setParticipantsDialogOpen,

    // Handlers
    getUserCandidacy,
    handleElectionClick,
    handleConfirmCandidacy,
  };
}
