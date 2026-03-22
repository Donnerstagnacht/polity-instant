'use client';

import { Crown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { formatVoteResultSentence } from '../logic/votePhaseHelpers';

interface VoteResultSentenceProps {
  type: 'vote' | 'election';
  result: 'passed' | 'rejected' | 'tie';
  winnerName?: string;
  winnerLink?: string;
  positionName?: string;
  positionLink?: string;
  voteSharePercent?: number;
  isFinal?: boolean;
  className?: string;
}

/**
 * Standardized result sentence displayed above vote results.
 *
 * For elections: "For the election of <position>, <winner> won with <share>% of votes."
 * For votes: "The motion was accepted/rejected with <share>% of votes."
 *
 * Winner gets a crown icon + golden highlight when the final vote is over.
 */
export function VoteResultSentence({
  type,
  result,
  winnerName,
  winnerLink,
  positionName,
  positionLink,
  voteSharePercent,
  isFinal,
  className,
}: VoteResultSentenceProps) {
  const { t } = useTranslation();

  const isWinner = result === 'passed' && type === 'election' && winnerName;

  // Render a semantic sentence using the pure helper
  const plainSentence = formatVoteResultSentence(type, result, winnerName, positionName, voteSharePercent);

  // For elections with a winner, render a rich version with links + crown
  if (isWinner && isFinal) {
    const positionPart = positionName ? (
      positionLink ? (
        <Link to={positionLink} className="font-medium underline underline-offset-4 hover:text-primary">
          {positionName}
        </Link>
      ) : (
        <span className="font-medium">{positionName}</span>
      )
    ) : null;

    const winnerPart = winnerLink ? (
      <Link to={winnerLink} className="font-semibold text-yellow-700 underline underline-offset-4 hover:text-yellow-600 dark:text-yellow-400">
        {winnerName}
      </Link>
    ) : (
      <span className="font-semibold text-yellow-700 dark:text-yellow-400">{winnerName}</span>
    );

    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm dark:bg-yellow-950/30',
          className,
        )}
      >
        <Crown className="h-5 w-5 shrink-0 text-yellow-500" />
        <p>
          {positionPart ? (
            <>
              {t('features.events.voting.forElectionOf', 'For the election of')}{' '}
              {positionPart},{' '}
              {winnerPart}{' '}
              {t('features.events.voting.wonWith', 'won')}
              {voteSharePercent !== undefined && (
                <>
                  {' '}
                  {t('features.events.voting.withShare', 'with')}{' '}
                  {voteSharePercent}%{' '}
                  {t('features.events.voting.ofVotes', 'of votes')}
                </>
              )}
              .
            </>
          ) : (
            <>
              {winnerPart}{' '}
              {t('features.events.voting.wonElection', 'won the election')}
              {voteSharePercent !== undefined && (
                <>
                  {' '}
                  {t('features.events.voting.withShare', 'with')}{' '}
                  {voteSharePercent}%
                </>
              )}
              .
            </>
          )}
        </p>
      </div>
    );
  }

  // Default: simple text sentence
  const isSuccess = result === 'passed';

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 text-sm',
        isSuccess
          ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
          : result === 'rejected'
            ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
        className,
      )}
    >
      <p>{plainSentence}</p>
    </div>
  );
}
