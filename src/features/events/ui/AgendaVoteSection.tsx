'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Vote,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Play,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';

interface VoteEntry {
  id: string;
  vote: 'yes' | 'no' | 'abstain';
  isIndication?: boolean;
  voter?: {
    id: string;
    name?: string;
  };
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  characterCount?: number;
  votingOrder?: number;
  status: string;
  activatedAt?: Date;
  completedAt?: Date;
}

interface AgendaVoteSectionProps {
  amendmentId: string;
  amendmentTitle: string;
  voteEntries: VoteEntry[];
  changeRequests: ChangeRequest[];
  changeRequestVotes: Record<string, VoteEntry[]>;
  userVote?: VoteEntry;
  userChangeRequestVotes: Record<string, VoteEntry>;
  agendaStatus: 'planned' | 'active' | 'completed';
  canVote: boolean;
  canManageVotes: boolean;
  isVotingLoading?: boolean;
  onVote: (vote: 'yes' | 'no' | 'abstain') => void;
  onChangeRequestVote: (changeRequestId: string, vote: 'yes' | 'no' | 'abstain') => void;
  onActivateChangeRequest?: (changeRequestId: string) => void;
  className?: string;
}

/**
 * Calculate vote statistics
 */
function calculateVoteStats(votes: VoteEntry[], isIndicationPhase: boolean) {
  const indicationVotes = votes.filter(
    v => v.isIndication || (isIndicationPhase && v.isIndication !== false)
  );
  const actualVotes = votes.filter(v => !v.isIndication && !isIndicationPhase);

  const countVotes = (voteList: VoteEntry[]) => ({
    yes: voteList.filter(v => v.vote === 'yes').length,
    no: voteList.filter(v => v.vote === 'no').length,
    abstain: voteList.filter(v => v.vote === 'abstain').length,
    total: voteList.length,
  });

  return {
    indication: countVotes(indicationVotes),
    actual: countVotes(actualVotes),
    showBoth: !isIndicationPhase && indicationVotes.length > 0,
  };
}

/**
 * Horizontal vote bar visualization
 */
function VoteBar({
  yes,
  no,
  abstain,
  total,
  label,
  showAbsolute = false,
}: {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  label?: string;
  showAbsolute?: boolean;
}) {
  const { t } = useTranslation();

  if (total === 0) {
    return (
      <div className="space-y-1">
        {label && <div className="text-xs text-muted-foreground">{label}</div>}
        <div className="h-3 rounded-full bg-muted" />
        <div className="text-xs text-muted-foreground">
          {t('features.events.agenda.noVotesYet')}
        </div>
      </div>
    );
  }

  const yesPercent = (yes / total) * 100;
  const noPercent = (no / total) * 100;
  const abstainPercent = (abstain / total) * 100;

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {label && <div className="text-xs text-muted-foreground">{label}</div>}
        <div className="flex h-3 overflow-hidden rounded-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t('features.events.agenda.voteYes')}: {yes} ({yesPercent.toFixed(1)}%)
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-red-500 transition-all" style={{ width: `${noPercent}%` }} />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t('features.events.agenda.voteNo')}: {no} ({noPercent.toFixed(1)}%)
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gray-400 transition-all" style={{ width: `${abstainPercent}%` }} />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t('features.events.agenda.voteAbstain')}: {abstain} ({abstainPercent.toFixed(1)}%)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="h-3 w-3" />
            {showAbsolute ? yes : `${yesPercent.toFixed(0)}%`}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <ThumbsDown className="h-3 w-3" />
            {showAbsolute ? no : `${noPercent.toFixed(0)}%`}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Minus className="h-3 w-3" />
            {showAbsolute ? abstain : `${abstainPercent.toFixed(0)}%`}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * AgendaVoteSection - Section 3: Vote & Results for Amendment Votes
 *
 * Displays:
 * - Collapsible change request votes (ordered by characterCount)
 * - Final amendment vote (blocked until all CRs are voted)
 * - Vote button with confirmation dialog
 * - Indication vs actual results display
 */
export function AgendaVoteSection({
  amendmentId,
  amendmentTitle,
  voteEntries,
  changeRequests,
  changeRequestVotes,
  userVote,
  userChangeRequestVotes,
  agendaStatus,
  canVote,
  canManageVotes,
  isVotingLoading,
  onVote,
  onChangeRequestVote,
  onActivateChangeRequest,
  className,
}: AgendaVoteSectionProps) {
  const { t } = useTranslation();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | null>(null);
  const [changeRequestsExpanded, setChangeRequestsExpanded] = useState(true);
  const [crVoteDialogOpen, setCrVoteDialogOpen] = useState(false);
  const [selectedCrId, setSelectedCrId] = useState<string | null>(null);
  const [selectedCrVote, setSelectedCrVote] = useState<'yes' | 'no' | 'abstain' | null>(null);

  const isIndicationPhase = agendaStatus === 'planned';
  const isVotingActive = agendaStatus === 'active';
  const isCompleted = agendaStatus === 'completed';

  // Sort change requests by votingOrder or characterCount
  const sortedChangeRequests = useMemo(() => {
    return [...changeRequests].sort((a, b) => {
      if (a.votingOrder !== undefined && b.votingOrder !== undefined) {
        return a.votingOrder - b.votingOrder;
      }
      if (a.votingOrder !== undefined) return -1;
      if (b.votingOrder !== undefined) return 1;
      return (b.characterCount || 0) - (a.characterCount || 0);
    });
  }, [changeRequests]);

  // Check if all change requests are completed
  const allChangeRequestsCompleted = sortedChangeRequests.every(cr => cr.completedAt);
  const canVoteFinal = allChangeRequestsCompleted || sortedChangeRequests.length === 0;

  const stats = calculateVoteStats(voteEntries, isIndicationPhase);

  const handleVoteClick = (vote: 'yes' | 'no' | 'abstain') => {
    setSelectedVote(vote);
    setVoteDialogOpen(true);
  };

  const handleConfirmVote = () => {
    if (selectedVote) {
      onVote(selectedVote);
    }
    setVoteDialogOpen(false);
    setSelectedVote(null);
  };

  const handleCrVoteClick = (crId: string, vote: 'yes' | 'no' | 'abstain') => {
    setSelectedCrId(crId);
    setSelectedCrVote(vote);
    setCrVoteDialogOpen(true);
  };

  const handleConfirmCrVote = () => {
    if (selectedCrId && selectedCrVote) {
      onChangeRequestVote(selectedCrId, selectedCrVote);
    }
    setCrVoteDialogOpen(false);
    setSelectedCrId(null);
    setSelectedCrVote(null);
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          {t('features.events.agenda.voteAndResults')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Change Request Votes */}
        {sortedChangeRequests.length > 0 && (
          <Collapsible open={changeRequestsExpanded} onOpenChange={setChangeRequestsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  {t('features.events.agenda.changeRequests')} ({sortedChangeRequests.length})
                </span>
                {changeRequestsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              {!allChangeRequestsCompleted && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/30">
                  <p className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4" />
                    {t('features.events.agenda.voteChangeRequestsFirst')}
                  </p>
                </div>
              )}
              {sortedChangeRequests.map((cr, index) => {
                const crVotes = changeRequestVotes[cr.id] || [];
                const crStats = calculateVoteStats(crVotes, !cr.activatedAt);
                const userCrVote = userChangeRequestVotes[cr.id];
                const isActivated = !!cr.activatedAt;
                const isCrCompleted = !!cr.completedAt;

                return (
                  <div
                    key={cr.id}
                    className={cn(
                      'rounded-lg border p-4',
                      isCrCompleted && 'bg-muted/30',
                      isActivated && !isCrCompleted && 'border-primary/50 bg-primary/5'
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{cr.title}</span>
                        {isCrCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      {cr.characterCount && (
                        <Badge variant="secondary" className="text-xs">
                          {cr.characterCount} chars
                        </Badge>
                      )}
                    </div>

                    <p className="mb-3 text-sm text-muted-foreground">{cr.description}</p>

                    {/* CR Vote Results */}
                    <div className="mb-3 space-y-2">
                      {!isActivated ? (
                        <VoteBar
                          {...crStats.indication}
                          label={`${t('features.events.agenda.indication')} *`}
                        />
                      ) : (
                        <>
                          {crStats.showBoth && (
                            <VoteBar
                              {...crStats.indication}
                              label={`${t('features.events.agenda.indication')}`}
                            />
                          )}
                          <VoteBar
                            {...crStats.actual}
                            label={
                              crStats.showBoth ? t('features.events.agenda.actual') : undefined
                            }
                          />
                        </>
                      )}
                    </div>

                    {/* CR Actions */}
                    {!isCrCompleted && (
                      <div className="flex items-center justify-center gap-2">
                        {!isActivated && canManageVotes && onActivateChangeRequest && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onActivateChangeRequest(cr.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {t('features.events.agenda.activate')}
                          </Button>
                        )}
                        {(isActivated || isIndicationPhase) && canVote && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={userCrVote?.vote === 'yes' ? 'default' : 'outline'}
                              className={userCrVote?.vote === 'yes' ? 'bg-green-600' : ''}
                              onClick={() => handleCrVoteClick(cr.id, 'yes')}
                              disabled={isVotingLoading}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={userCrVote?.vote === 'no' ? 'default' : 'outline'}
                              className={userCrVote?.vote === 'no' ? 'bg-red-600' : ''}
                              onClick={() => handleCrVoteClick(cr.id, 'no')}
                              disabled={isVotingLoading}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={userCrVote?.vote === 'abstain' ? 'default' : 'outline'}
                              onClick={() => handleCrVoteClick(cr.id, 'abstain')}
                              disabled={isVotingLoading}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Divider */}
        {sortedChangeRequests.length > 0 && <hr className="border-dashed" />}

        {/* Final Amendment Vote */}
        <div className={cn(!canVoteFinal && 'opacity-50')}>
          <h3 className="mb-4 font-semibold">
            {t('features.events.agenda.finalVote')}: {amendmentTitle}
          </h3>

          {/* Vote Results */}
          <div className="mb-4 space-y-3">
            {isIndicationPhase ? (
              <VoteBar
                {...stats.indication}
                label={`${t('features.events.agenda.indication')} *`}
              />
            ) : (
              <>
                {stats.showBoth && (
                  <VoteBar {...stats.indication} label={t('features.events.agenda.indication')} />
                )}
                <VoteBar
                  {...stats.actual}
                  label={stats.showBoth ? t('features.events.agenda.actual') : undefined}
                />
              </>
            )}
          </div>

          {/* Vote Options */}
          {!isCompleted && canVote && canVoteFinal && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  size="lg"
                  variant={userVote?.vote === 'yes' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    userVote?.vote === 'yes'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  )}
                  onClick={() => handleVoteClick('yes')}
                  disabled={isVotingLoading}
                >
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  {t('features.events.agenda.voteYesLabel')}
                </Button>
                <Button
                  size="lg"
                  variant={userVote?.vote === 'no' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    userVote?.vote === 'no'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'border-red-600 text-red-600 hover:bg-red-50'
                  )}
                  onClick={() => handleVoteClick('no')}
                  disabled={isVotingLoading}
                >
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  {t('features.events.agenda.voteNoLabel')}
                </Button>
                <Button
                  size="lg"
                  variant={userVote?.vote === 'abstain' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    userVote?.vote === 'abstain'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'border-gray-500 text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={() => handleVoteClick('abstain')}
                  disabled={isVotingLoading}
                >
                  <Minus className="mr-2 h-5 w-5" />
                  {t('features.events.agenda.voteAbstainLabel')}
                </Button>
              </div>

              {/* Centered Vote Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="min-w-[200px]"
                  onClick={() => setVoteDialogOpen(true)}
                  disabled={isVotingLoading}
                >
                  <Vote className="mr-2 h-5 w-5" />
                  {userVote
                    ? t('features.events.agenda.changeVote')
                    : isIndicationPhase
                      ? t('features.events.agenda.indicateVote')
                      : t('features.events.agenda.castVote')}
                </Button>
              </div>
            </div>
          )}

          {/* User's current vote */}
          {userVote && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                {userVote.isIndication
                  ? t('features.events.agenda.yourIndication')
                  : t('features.events.agenda.yourVote')}
                :{' '}
                <span className="font-medium">
                  {userVote.vote === 'yes'
                    ? t('features.events.agenda.voteYes')
                    : userVote.vote === 'no'
                      ? t('features.events.agenda.voteNo')
                      : t('features.events.agenda.voteAbstain')}
                </span>
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Vote Confirmation Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isIndicationPhase
                ? t('features.events.agenda.confirmIndication')
                : t('features.events.agenda.confirmVote')}
            </DialogTitle>
            <DialogDescription>{amendmentTitle}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <Button
              size="lg"
              variant={selectedVote === 'yes' ? 'default' : 'outline'}
              className={cn(
                selectedVote === 'yes'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              )}
              onClick={() => setSelectedVote('yes')}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteYesLabel')}
            </Button>
            <Button
              size="lg"
              variant={selectedVote === 'no' ? 'default' : 'outline'}
              className={cn(
                selectedVote === 'no'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'border-red-600 text-red-600 hover:bg-red-50'
              )}
              onClick={() => setSelectedVote('no')}
            >
              <ThumbsDown className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteNoLabel')}
            </Button>
            <Button
              size="lg"
              variant={selectedVote === 'abstain' ? 'default' : 'outline'}
              onClick={() => setSelectedVote('abstain')}
            >
              <Minus className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteAbstain')}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button onClick={handleConfirmVote} disabled={!selectedVote}>
              {t('common.actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CR Vote Confirmation Dialog */}
      <Dialog open={crVoteDialogOpen} onOpenChange={setCrVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.events.agenda.confirmVote')}</DialogTitle>
            <DialogDescription>
              {sortedChangeRequests.find(cr => cr.id === selectedCrId)?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <Button
              size="lg"
              variant={selectedCrVote === 'yes' ? 'default' : 'outline'}
              className={cn(
                selectedCrVote === 'yes'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              )}
              onClick={() => setSelectedCrVote('yes')}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteYes')}
            </Button>
            <Button
              size="lg"
              variant={selectedCrVote === 'no' ? 'default' : 'outline'}
              className={cn(
                selectedCrVote === 'no'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'border-red-600 text-red-600 hover:bg-red-50'
              )}
              onClick={() => setSelectedCrVote('no')}
            >
              <ThumbsDown className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteNo')}
            </Button>
            <Button
              size="lg"
              variant={selectedCrVote === 'abstain' ? 'default' : 'outline'}
              onClick={() => setSelectedCrVote('abstain')}
            >
              <Minus className="mr-2 h-5 w-5" />
              {t('features.events.agenda.voteAbstain')}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCrVoteDialogOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button onClick={handleConfirmCrVote} disabled={!selectedCrVote}>
              {t('common.actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
