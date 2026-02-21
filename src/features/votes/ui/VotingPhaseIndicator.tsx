/**
 * VotingPhaseIndicator Component
 *
 * Visual indicator showing the current voting phase with timer
 * and result display when completed.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/use-translation';
import { useSyncedVotingTimer } from '../hooks/useVotingTimer';
import { Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, Timer } from 'lucide-react';
import { cn } from '@/utils/utils';

type VotingPhase = 'setup' | 'introduction' | 'voting' | 'closed';
type VotingResult = 'passed' | 'rejected' | 'tie' | null;

interface VotingPhaseIndicatorProps {
  phase: VotingPhase;
  duration?: number;
  startedAt?: number;
  result?: VotingResult;
  acceptCount?: number;
  rejectCount?: number;
  abstainCount?: number;
  totalEligible?: number;
  onExpire?: () => void;
  className?: string;
}

const phaseConfig: Record<VotingPhase, { icon: React.ElementType; color: string }> = {
  setup: { icon: PauseCircle, color: 'bg-gray-500' },
  introduction: { icon: PlayCircle, color: 'bg-blue-500' },
  voting: { icon: Timer, color: 'bg-amber-500' },
  closed: { icon: CheckCircle, color: 'bg-green-500' },
};

const resultConfig: Record<
  NonNullable<VotingResult>,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  passed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  tie: { icon: PauseCircle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
};

export function VotingPhaseIndicator({
  phase,
  duration = 0,
  startedAt,
  result,
  acceptCount = 0,
  rejectCount = 0,
  abstainCount = 0,
  totalEligible = 0,
  onExpire,
  className,
}: VotingPhaseIndicatorProps) {
  const { t } = useTranslation();

  const { formattedTime, timeRemaining, isExpired } = useSyncedVotingTimer(
    phase === 'voting' ? startedAt : undefined,
    duration,
    onExpire
  );

  const totalVoted = acceptCount + rejectCount + abstainCount;
  const voteProgress = totalEligible > 0 ? (totalVoted / totalEligible) * 100 : 0;

  const config = phaseConfig[phase];
  const PhaseIcon = config.icon;

  // Show result if voting is closed
  if (phase === 'closed' && result) {
    const resConfig = resultConfig[result];
    const ResultIcon = resConfig.icon;

    return (
      <div className={cn('rounded-lg p-4', resConfig.bgColor, className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ResultIcon className={cn('h-5 w-5', resConfig.color)} />
            <span className={cn('font-semibold', resConfig.color)}>
              {t(`features.events.voting.${result}`)}
            </span>
          </div>
          <Badge variant="outline">{t('features.events.voting.closed')}</Badge>
        </div>

        {/* Vote breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{acceptCount}</div>
            <div className="text-xs text-muted-foreground">
              {t('features.events.voting.accept')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{rejectCount}</div>
            <div className="text-xs text-muted-foreground">
              {t('features.events.voting.reject')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{abstainCount}</div>
            <div className="text-xs text-muted-foreground">
              {t('features.events.voting.abstain')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      {/* Phase indicator */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-full p-1', config.color)}>
            <PhaseIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium">{t(`features.events.voting.phases.${phase}`)}</span>
        </div>

        {/* Timer for voting phase */}
        {phase === 'voting' && duration > 0 && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 font-mono text-sm',
              isExpired || timeRemaining < 30
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-muted'
            )}
          >
            <Clock className="h-3 w-3" />
            {formattedTime}
          </div>
        )}
      </div>

      {/* Vote progress for voting phase */}
      {phase === 'voting' && totalEligible > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('features.events.voting.votes')}</span>
            <span>
              {totalVoted} / {totalEligible}
            </span>
          </div>
          <Progress value={voteProgress} className="h-2" />

          {/* Current vote counts */}
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span className="text-green-600">✓ {acceptCount}</span>
            <span className="text-red-600">✗ {rejectCount}</span>
            <span className="text-gray-500">○ {abstainCount}</span>
          </div>
        </div>
      )}

      {/* Introduction phase message */}
      {phase === 'introduction' && (
        <p className="text-sm text-muted-foreground">
          {t('features.events.voting.setup.startVoting')}
        </p>
      )}

      {/* Setup phase message */}
      {phase === 'setup' && (
        <p className="text-sm text-muted-foreground">{t('features.events.voting.setup.title')}</p>
      )}
    </div>
  );
}
