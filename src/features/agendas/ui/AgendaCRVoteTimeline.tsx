'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Progress } from '@/features/shared/ui/ui/progress';
import { Vote } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAgendaItemCRVoting } from '../hooks/useAgendaItemCRVoting';
import { ChangeRequestTimelineCard } from './ChangeRequestTimelineCard';

interface AgendaCRVoteTimelineProps {
  agendaItemId: string;
  userId?: string;
  canManage?: boolean;
  canVote?: boolean;
}

export function AgendaCRVoteTimeline({
  agendaItemId,
  userId,
  canManage = false,
  canVote = false,
}: AgendaCRVoteTimelineProps) {
  const { t } = useTranslation();
  const {
    crTimeline,
    currentItem,
    completedItems,
    progress,
    isLoading,
    hasUserVoted,
    getUserSelectedChoiceIds,
    allCRsProcessed,
    isTimelineComplete,
    castCRVote,
    startIndicativePhase,
    startFinalPhase,
    closeVoting,
  } = useAgendaItemCRVoting(agendaItemId, userId);

  console.log('[AgendaCRVoteTimeline] agendaItemId:', agendaItemId);
  console.log('[AgendaCRVoteTimeline] isLoading:', isLoading);
  console.log('[AgendaCRVoteTimeline] crTimeline.length:', crTimeline.length);
  console.log('[AgendaCRVoteTimeline] crTimeline:', crTimeline);
  console.log('[AgendaCRVoteTimeline] currentItem:', currentItem);

  if (isLoading || crTimeline.length === 0) {
    console.log('[AgendaCRVoteTimeline] EARLY RETURN — isLoading:', isLoading, 'crTimeline.length:', crTimeline.length);
    return null;
  }

  const progressPercent = Math.round(progress * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            <CardTitle className="text-base">
              {t('features.agendas.crTimeline.title')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedItems.length}/{crTimeline.length}
            </Badge>
            {isTimelineComplete && (
              <Badge variant="default" className="bg-green-600">
                {t('features.agendas.crTimeline.allCompleted')}
              </Badge>
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {crTimeline.map((item, index) => (
            <ChangeRequestTimelineCard
              key={item.id}
              item={item}
              index={index}
              isCurrent={currentItem?.id === item.id}
              hasUserVoted={hasUserVoted(item)}
              userSelectedChoiceIds={getUserSelectedChoiceIds(item)}
              canManage={canManage}
              canVote={canVote}
              isFinalVoteLocked={item.is_final_vote && !allCRsProcessed}
              onCastVote={castCRVote}
              onStartIndicative={startIndicativePhase}
              onStartFinal={startFinalPhase}
              onCloseVoting={closeVoting}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
