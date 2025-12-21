import { db } from '../../../../db/db';

export function useAgendaItemDetail(agendaItemId: string) {
  const { data, isLoading, error } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          id: agendaItemId,
        },
      },
      creator: {},
      event: {
        organizer: {},
      },
      election: {
        candidates: {},
        votes: {},
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

  const agendaItem = data?.agendaItems?.[0];
  const event = agendaItem?.event;

  return {
    agendaItem,
    event,
    electionVotes: data?.electionVotes || [],
    amendmentVoteEntries: data?.amendmentVoteEntries || [],
    isLoading,
    error,
  };
}
