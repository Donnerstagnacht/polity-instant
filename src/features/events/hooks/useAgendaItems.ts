import { db } from '../../../../db/db';

export function useAgendaItems(eventId: string) {
  const { data, isLoading, error } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          'event.id': eventId,
        },
      },
      creator: {},
      event: {},
      election: {
        candidates: {},
        votes: {},
        position: {
          group: {},
        },
      },
      amendmentVote: {
        changeRequests: {},
        voteEntries: {},
      },
      speakerList: {
        user: {},
      },
    },
    electionVotes: {
      voter: {},
      candidate: {},
      election: {},
    },
    amendmentVoteEntries: {
      voter: {},
      amendmentVote: {},
    },
  });

  const agendaItems = (data?.agendaItems || [])
    .filter((item: any) => item.event?.id === eventId)
    .sort((a: any, b: any) => a.order - b.order);

  return {
    agendaItems,
    electionVotes: data?.electionVotes || [],
    amendmentVoteEntries: data?.amendmentVoteEntries || [],
    isLoading,
    error,
  };
}
