'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Users, Play, Square, CheckCircle2, Loader2, Timer } from 'lucide-react';
import { useEventVoting, type MajorityType, type VotingType } from '../hooks/useEventVoting';
import { formatTimeRemaining, getMajorityTypeText } from '@/utils/voting-utils';
import { useTranslation } from '@/hooks/use-translation';

interface VotingSessionManagerProps {
  eventId: string;
  agendaItemId: string;
  agendaItemTitle: string;
  votingType: VotingType;
  targetEntityId: string;
}

export function VotingSessionManager({
  eventId,
  agendaItemId,
  agendaItemTitle,
  votingType,
  targetEntityId,
}: VotingSessionManagerProps) {
  const { t } = useTranslation();
  const {
    currentSession,
    eligibleVoters,
    votedCount,
    totalVoters,
    canManageVoting,
    voteResults,
    isLoading,
    timeRemaining,
    startIntroductionPhase,
    startVotingPhase,
    closeVoting,
  } = useEventVoting(eventId, agendaItemId);

  const [majorityType, setMajorityType] = useState<MajorityType>('simple');
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default

  const handleStartIntroduction = async () => {
    await startIntroductionPhase({
      agendaItemId,
      votingType,
      targetEntityId,
      majorityType,
      autoCloseOnAllVoted: true,
    });
  };

  const handleStartVoting = async () => {
    if (currentSession) {
      await startVotingPhase(currentSession.id, timeLimit);
    }
  };

  const handleCloseVoting = async () => {
    if (currentSession) {
      await closeVoting(currentSession.id);
    }
  };

  // Calculate progress
  const votingProgress = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

  // No active session - show start options
  if (!currentSession && canManageVoting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className="h-5 w-5" />
            {t('features.events.voting.startVoting', 'Start Voting')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('features.events.voting.majorityType', 'Majority Type')}</Label>
            <Select value={majorityType} onValueChange={v => setMajorityType(v as MajorityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">
                  {t('features.events.voting.simpleMajority', 'Simple Majority')}
                </SelectItem>
                <SelectItem value="absolute">
                  {t('features.events.voting.absoluteMajority', 'Absolute Majority')}
                </SelectItem>
                <SelectItem value="two_thirds">
                  {t('features.events.voting.twoThirdsMajority', 'Two-Thirds Majority')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('features.events.voting.timeLimit', 'Time Limit (seconds)')}</Label>
            <Input
              type="number"
              value={timeLimit}
              onChange={e => setTimeLimit(parseInt(e.target.value) || 300)}
              min={30}
              max={3600}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {totalVoters} {t('features.events.voting.eligibleVoters', 'eligible voters')}
            </span>
          </div>

          <Button
            onClick={handleStartIntroduction}
            disabled={isLoading || totalVoters === 0}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {t('features.events.voting.startIntroduction', 'Start Introduction Phase')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentSession) {
    return null;
  }

  return (
    <Card className={currentSession.phase === 'voting' ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {currentSession.phase === 'introduction' && (
              <>
                <Play className="h-5 w-5 text-yellow-500" />
                {t('features.events.voting.introduction', 'Introduction Phase')}
              </>
            )}
            {currentSession.phase === 'voting' && (
              <>
                <Timer className="h-5 w-5 animate-pulse text-primary" />
                {t('features.events.voting.votingActive', 'Voting Active')}
              </>
            )}
            {currentSession.phase === 'completed' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {t('features.events.voting.completed', 'Completed')}
              </>
            )}
          </CardTitle>
          <Badge variant={currentSession.result === 'passed' ? 'default' : 'secondary'}>
            {getMajorityTypeText(currentSession.majorityType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer for voting phase */}
        {currentSession.phase === 'voting' && timeRemaining !== null && (
          <div className="flex items-center justify-center gap-2 font-mono text-2xl">
            <Clock className="h-6 w-6" />
            <span className={timeRemaining < 60 ? 'text-red-500' : ''}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        )}

        {/* Voting progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('features.events.voting.votesReceived', 'Votes Received')}
            </span>
            <span className="font-medium">
              {votedCount} / {totalVoters}
            </span>
          </div>
          <Progress value={votingProgress} className="h-2" />
        </div>

        {/* Vote results (show after voting) */}
        {(currentSession.phase === 'voting' || currentSession.phase === 'completed') && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-green-100 p-2 dark:bg-green-900/30">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {voteResults.accept}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('features.events.voting.accept', 'Accept')}
              </div>
            </div>
            <div className="rounded bg-red-100 p-2 dark:bg-red-900/30">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {voteResults.reject}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('features.events.voting.reject', 'Reject')}
              </div>
            </div>
            <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {voteResults.abstain}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('features.events.voting.abstain', 'Abstain')}
              </div>
            </div>
          </div>
        )}

        {/* Result badge */}
        {currentSession.phase === 'completed' && currentSession.result && (
          <div className="flex justify-center">
            <Badge
              variant={currentSession.result === 'passed' ? 'default' : 'destructive'}
              className="px-4 py-2 text-lg"
            >
              {currentSession.result === 'passed'
                ? t('features.events.voting.passed', 'Passed')
                : currentSession.result === 'rejected'
                  ? t('features.events.voting.rejected', 'Rejected')
                  : t('features.events.voting.tie', 'Tie')}
            </Badge>
          </div>
        )}

        {/* Control buttons for managers */}
        {canManageVoting && (
          <div className="flex gap-2">
            {currentSession.phase === 'introduction' && (
              <Button onClick={handleStartVoting} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {t('features.events.voting.startVoting', 'Start Voting')}
              </Button>
            )}

            {currentSession.phase === 'voting' && (
              <Button
                variant="destructive"
                onClick={handleCloseVoting}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Square className="mr-2 h-4 w-4" />
                )}
                {t('features.events.voting.closeVoting', 'Close Voting')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
