import { useAgendaItemsByEvent } from '@/zero/events/useEventState';

export function useAgendaItems(eventId: string) {
  const { agendaItems, electionVotes, amendmentVoteEntries, isLoading } = useAgendaItemsByEvent(eventId);

  return {
    agendaItems,
    electionVotes,
    amendmentVoteEntries,
    isLoading,
    error: undefined,
  };
}
