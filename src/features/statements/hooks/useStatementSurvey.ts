import { useMemo } from 'react';

interface SurveyVote {
  id: string;
  option_id: string;
  user_id: string;
}

interface SurveyOption {
  id: string;
  label: string;
  vote_count: number;
  position: number;
  votes?: SurveyVote[];
}

interface Survey {
  id: string;
  question: string;
  ends_at: number;
  options?: SurveyOption[];
}

interface UseStatementSurveyOptions {
  survey: Survey | null | undefined;
  userId?: string;
}

export function useStatementSurvey({ survey, userId }: UseStatementSurveyOptions) {
  const options = useMemo(
    () =>
      [...(survey?.options ?? [])].sort((a, b) => a.position - b.position),
    [survey?.options],
  );

  // Compute vote counts from actual vote records (not denormalized vote_count)
  const totalVotes = useMemo(
    () => options.reduce((sum, o) => sum + (o.votes?.length ?? 0), 0),
    [options],
  );

  const percentages = useMemo(
    () =>
      options.map((o) => {
        const voteCount = o.votes?.length ?? 0;
        return {
          optionId: o.id,
          label: o.label,
          voteCount,
          percent: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0,
        };
      }),
    [options, totalVotes],
  );

  // Votes are nested inside each option (from query: surveys → options → votes)
  const userVote = useMemo(() => {
    if (!userId) return null;
    for (const opt of options) {
      const vote = opt.votes?.find((v) => v.user_id === userId);
      if (vote) return vote;
    }
    return null;
  }, [userId, options]);

  const isExpired = survey ? Date.now() > survey.ends_at : false;

  const timeRemaining = useMemo(() => {
    if (!survey || isExpired) return null;
    const diff = survey.ends_at - Date.now();
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [survey, isExpired]);

  return {
    survey,
    options,
    totalVotes,
    percentages,
    userVote,
    isExpired,
    timeRemaining,
  };
}
