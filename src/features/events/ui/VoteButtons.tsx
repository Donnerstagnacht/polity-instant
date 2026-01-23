'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus, Loader2 } from 'lucide-react';
import { useEventVoting, type VoteValue } from '../hooks/useEventVoting';
import { useTranslation } from '@/hooks/use-translation';

interface VoteButtonsProps {
  eventId: string;
  agendaItemId: string;
  sessionId: string;
  size?: 'sm' | 'default' | 'lg';
}

export function VoteButtons({
  eventId,
  agendaItemId,
  sessionId,
  size = 'default',
}: VoteButtonsProps) {
  const { t } = useTranslation();
  const { canVote, hasUserVoted, userVote, currentSession, isLoading, castVote } = useEventVoting(
    eventId,
    agendaItemId
  );

  const handleVote = async (vote: VoteValue) => {
    await castVote(sessionId, vote);
  };

  // Don't show if voting is not active
  if (!currentSession || currentSession.phase !== 'voting') {
    return null;
  }

  // Show user's vote if already voted
  if (hasUserVoted && userVote) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Badge
          variant={
            userVote === 'accept' ? 'default' : userVote === 'reject' ? 'destructive' : 'secondary'
          }
          className="px-4 py-2"
        >
          {userVote === 'accept' && <Check className="mr-2 h-4 w-4" />}
          {userVote === 'reject' && <X className="mr-2 h-4 w-4" />}
          {userVote === 'abstain' && <Minus className="mr-2 h-4 w-4" />}
          {t('features.events.voting.yourVote', 'Your Vote')}:{' '}
          {userVote === 'accept'
            ? t('features.events.voting.accept', 'Accept')
            : userVote === 'reject'
              ? t('features.events.voting.reject', 'Reject')
              : t('features.events.voting.abstain', 'Abstain')}
        </Badge>
      </div>
    );
  }

  // Don't show if user can't vote
  if (!canVote) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        {t('features.events.voting.noVotingRights', 'You do not have voting rights')}
      </div>
    );
  }

  const buttonSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default';

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="default"
        size={buttonSize}
        onClick={() => handleVote('accept')}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        {t('features.events.voting.accept', 'Accept')}
      </Button>

      <Button
        variant="destructive"
        size={buttonSize}
        onClick={() => handleVote('reject')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        {t('features.events.voting.reject', 'Reject')}
      </Button>

      <Button
        variant="secondary"
        size={buttonSize}
        onClick={() => handleVote('abstain')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Minus className="mr-2 h-4 w-4" />
        )}
        {t('features.events.voting.abstain', 'Abstain')}
      </Button>
    </div>
  );
}
