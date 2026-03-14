import { cn } from '@/features/shared/utils/utils';
import { useStatementSurvey } from '@/features/statements/hooks/useStatementSurvey';
import { Button } from '@/features/shared/ui/ui/button';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Clock, Check } from 'lucide-react';

interface StatementSurveyProps {
  survey: {
    id: string;
    question: string;
    ends_at: number;
    options?: { id: string; label: string; vote_count: number; position: number; votes?: { id: string; option_id: string; user_id: string }[] }[];
  };
  userId?: string;
  onVote?: (optionId: string, existingVoteId?: string) => void;
  onRetract?: (voteId: string) => void;
  className?: string;
}

export function StatementSurvey({
  survey,
  userId,
  onVote,
  onRetract,
  className,
}: StatementSurveyProps) {
  const { t } = useTranslation();
  const { percentages, totalVotes, userVote, isExpired, timeRemaining } = useStatementSurvey({
    survey,
    userId,
  });

  const hasVoted = userVote != null;

  return (
    <div className={cn('space-y-3 rounded-lg border p-4', className)}>
      <p className="font-semibold">{survey.question}</p>

      <div className="space-y-2">
        {percentages.map(opt => {
          const isUserChoice = userVote?.option_id === opt.optionId;
          const canChangeVote = hasVoted && !isExpired && !isUserChoice;

          return (
            <div
              key={opt.optionId}
              className={cn(
                'space-y-1',
                canChangeVote && 'hover:bg-muted/50 cursor-pointer rounded-md p-1 transition-colors'
              )}
              onClick={canChangeVote ? () => onVote?.(opt.optionId, userVote?.id) : undefined}
            >
              {hasVoted || isExpired ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(isUserChoice && 'font-semibold')}>
                      {isUserChoice && <Check className="mr-1 inline h-3 w-3" />}
                      {opt.label}
                    </span>
                    <span className="text-muted-foreground">{opt.percent}%</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isUserChoice ? 'bg-primary' : 'bg-primary/40'
                      )}
                      style={{ width: `${opt.percent}%` }}
                    />
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onVote?.(opt.optionId)}
                >
                  {opt.label}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          {totalVotes} {t('features.statements.survey.votes')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isExpired
            ? t('features.statements.survey.expired')
            : `${t('features.statements.survey.endsIn')} ${timeRemaining}`}
        </span>
      </div>

      {hasVoted && !isExpired && onRetract && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-full text-xs"
          onClick={() => onRetract(userVote?.id ?? '')}
        >
          {t('features.statements.survey.retract')}
        </Button>
      )}
    </div>
  );
}
