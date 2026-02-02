'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Vote, UserPlus, CheckCircle2, Crown, User, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';

interface Candidate {
  id: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  status: 'nominated' | 'accepted' | 'withdrawn';
}

interface ElectionVote {
  id: string;
  candidateId: string;
  isIndication?: boolean;
  voter?: {
    id: string;
    name?: string;
  };
}

interface AgendaElectionSectionProps {
  positionId: string;
  positionName: string;
  candidates: Candidate[];
  electionVotes: ElectionVote[];
  userVote?: ElectionVote;
  agendaStatus: 'planned' | 'active' | 'completed';
  canVote: boolean;
  canBeCandidate: boolean;
  isUserCandidate: boolean;
  isVotingLoading?: boolean;
  isCandidateLoading?: boolean;
  onVote: (candidateId: string) => void;
  onBecomeCandidate: () => void;
  onWithdrawCandidacy?: () => void;
  className?: string;
}

interface CandidateVoteStats {
  candidateId: string;
  indicationCount: number;
  actualCount: number;
  indicationPercent: number;
  actualPercent: number;
}

/**
 * Calculate vote statistics for each candidate
 */
function calculateCandidateStats(
  candidates: Candidate[],
  votes: ElectionVote[],
  isIndicationPhase: boolean
): {
  stats: CandidateVoteStats[];
  totalIndication: number;
  totalActual: number;
  showBoth: boolean;
} {
  const indicationVotes = votes.filter(v => v.isIndication);
  const actualVotes = votes.filter(v => !v.isIndication);

  const stats = candidates.map(candidate => {
    const indCount = indicationVotes.filter(v => v.candidateId === candidate.id).length;
    const actCount = actualVotes.filter(v => v.candidateId === candidate.id).length;

    return {
      candidateId: candidate.id,
      indicationCount: indCount,
      actualCount: actCount,
      indicationPercent: indicationVotes.length > 0 ? (indCount / indicationVotes.length) * 100 : 0,
      actualPercent: actualVotes.length > 0 ? (actCount / actualVotes.length) * 100 : 0,
    };
  });

  return {
    stats,
    totalIndication: indicationVotes.length,
    totalActual: actualVotes.length,
    showBoth: !isIndicationPhase && indicationVotes.length > 0,
  };
}

/**
 * Horizontal vote bar for a single candidate
 */
function CandidateVoteBar({
  indicationPercent,
  actualPercent,
  indicationCount,
  actualCount,
  showBoth,
  isIndicationPhase,
}: {
  indicationPercent: number;
  actualPercent: number;
  indicationCount: number;
  actualCount: number;
  showBoth: boolean;
  isIndicationPhase: boolean;
}) {
  const { t } = useTranslation();

  if (isIndicationPhase) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-400/70 transition-all"
                    style={{ width: `${indicationPercent}%` }}
                  />
                </div>
                <span className="min-w-[50px] text-right text-xs text-muted-foreground">
                  {indicationPercent.toFixed(0)}% *
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {t('features.events.agenda.indication')}: {indicationCount}{' '}
              {t('features.events.agenda.votes')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {showBoth && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-400/50 transition-all"
                    style={{ width: `${indicationPercent}%` }}
                  />
                </div>
                <span className="min-w-[70px] text-right text-xs text-muted-foreground">
                  {t('features.events.agenda.indicationShort')}: {indicationPercent.toFixed(0)}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t('features.events.agenda.indication')}: {indicationCount}{' '}
                {t('features.events.agenda.votes')}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${actualPercent}%` }}
                />
              </div>
              <span className="min-w-[70px] text-right text-xs font-medium">
                {showBoth && `${t('features.events.agenda.actualShort')}: `}
                {actualPercent.toFixed(0)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {showBoth ? t('features.events.agenda.actual') : ''}: {actualCount}{' '}
              {t('features.events.agenda.votes')}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * AgendaElectionSection - Section 3: Vote & Results for Elections
 *
 * Displays:
 * - List of candidates with profile images
 * - Horizontal bar chart per candidate showing vote percentage
 * - "Become Candidate" button (if passive_voting permission)
 * - Vote button with confirmation dialog
 * - Indication vs actual results display
 */
export function AgendaElectionSection({
  positionId,
  positionName,
  candidates,
  electionVotes,
  userVote,
  agendaStatus,
  canVote,
  canBeCandidate,
  isUserCandidate,
  isVotingLoading,
  isCandidateLoading,
  onVote,
  onBecomeCandidate,
  onWithdrawCandidacy,
  className,
}: AgendaElectionSectionProps) {
  const { t } = useTranslation();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [voteSelectionDialogOpen, setVoteSelectionDialogOpen] = useState(false);

  const isIndicationPhase = agendaStatus === 'planned';
  const isVotingActive = agendaStatus === 'active';
  const isCompleted = agendaStatus === 'completed';

  // Show all candidates except withdrawn
  const visibleCandidates = useMemo(() => {
    return candidates.filter(c => c.status !== 'withdrawn');
  }, [candidates]);

  const { stats, totalIndication, totalActual, showBoth } = useMemo(() => {
    return calculateCandidateStats(visibleCandidates, electionVotes, isIndicationPhase);
  }, [visibleCandidates, electionVotes, isIndicationPhase]);

  // Find the leading candidate(s)
  const leadingCandidateId = useMemo(() => {
    if (stats.length === 0) return null;
    const maxVotes = Math.max(
      ...stats.map(s => (isIndicationPhase ? s.indicationCount : s.actualCount))
    );
    if (maxVotes === 0) return null;
    return stats.find(s => (isIndicationPhase ? s.indicationCount : s.actualCount) === maxVotes)
      ?.candidateId;
  }, [stats, isIndicationPhase]);

  const selectedCandidate = visibleCandidates.find(c => c.id === selectedCandidateId);

  const handleCandidateClick = (candidateId: string) => {
    if (!canVote || isCompleted) return;
    setSelectedCandidateId(candidateId);
    setVoteDialogOpen(true);
  };

  const handleConfirmVote = () => {
    if (selectedCandidateId) {
      onVote(selectedCandidateId);
    }
    setVoteDialogOpen(false);
    setVoteSelectionDialogOpen(false);
    setSelectedCandidateId(null);
  };

  const handleOpenVoteSelection = () => {
    setSelectedCandidateId(userVote?.candidateId || null);
    setVoteSelectionDialogOpen(true);
  };

  const handleSelectCandidateForVote = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleConfirmVoteFromSelection = () => {
    if (selectedCandidateId) {
      setVoteSelectionDialogOpen(false);
      setVoteDialogOpen(true);
    }
  };

  const handleBecomeCandidate = () => {
    onBecomeCandidate();
    setCandidateDialogOpen(false);
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {t('features.events.agenda.electionResults')}
          </CardTitle>
          <Badge variant="outline">{positionName}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vote count header */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isIndicationPhase
              ? `${totalIndication} ${t('features.events.agenda.indicationVotes')}`
              : `${totalActual} ${t('features.events.agenda.votes')}`}
          </span>
          {isIndicationPhase && (
            <Badge variant="secondary" className="text-xs">
              * {t('features.events.agenda.indicationOnly')}
            </Badge>
          )}
        </div>

        {/* Candidates List */}
        {visibleCandidates.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">{t('features.events.agenda.noCandidates')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleCandidates.map(candidate => {
              const candidateStats = stats.find(s => s.candidateId === candidate.id);
              const isLeading = candidate.id === leadingCandidateId && !isIndicationPhase;
              const isSelected = userVote?.candidateId === candidate.id;

              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    canVote && !isCompleted && 'cursor-pointer hover:bg-muted/50',
                    isSelected && 'border-primary bg-primary/5',
                    isLeading &&
                      isCompleted &&
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                  )}
                  onClick={() => handleCandidateClick(candidate.id)}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.user?.avatar} alt={candidate.user?.name} />
                      <AvatarFallback>
                        {candidate.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {candidate.user?.name || candidate.user?.email || 'Unknown'}
                        </span>
                        <Badge
                          variant={candidate.status === 'accepted' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {candidate.status === 'accepted'
                            ? t('features.events.agenda.candidateAccepted')
                            : t('features.events.agenda.candidateNominated')}
                        </Badge>
                        {isLeading && isCompleted && <Crown className="h-4 w-4 text-yellow-500" />}
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      {candidate.user?.email && candidate.user?.name && (
                        <span className="text-sm text-muted-foreground">
                          {candidate.user.email}
                        </span>
                      )}
                    </div>
                    {canVote && !isCompleted && (
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={e => {
                          e.stopPropagation();
                          handleCandidateClick(candidate.id);
                        }}
                      >
                        <Vote className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Vote bar */}
                  {candidateStats && (
                    <CandidateVoteBar
                      indicationPercent={candidateStats.indicationPercent}
                      actualPercent={candidateStats.actualPercent}
                      indicationCount={candidateStats.indicationCount}
                      actualCount={candidateStats.actualCount}
                      showBoth={showBoth}
                      isIndicationPhase={isIndicationPhase}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* User's current vote */}
        {userVote && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              {userVote.isIndication
                ? t('features.events.agenda.yourIndication')
                : t('features.events.agenda.yourVote')}
              :{' '}
              <span className="font-medium">
                {visibleCandidates.find(c => c.id === userVote.candidateId)?.user?.name ||
                  'Unknown'}
              </span>
            </span>
          </div>
        )}

        {/* Centered Vote Button */}
        {!isCompleted && canVote && visibleCandidates.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleOpenVoteSelection}
              disabled={isVotingLoading}
              className="min-w-[200px]"
            >
              {isVotingLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Vote className="mr-2 h-5 w-5" />
              )}
              {userVote
                ? t('features.events.agenda.changeVote')
                : isIndicationPhase
                  ? t('features.events.agenda.castIndication')
                  : t('features.events.agenda.castVote')}
            </Button>
          </div>
        )}

        {/* Become Candidate Button */}
        {!isCompleted && canBeCandidate && !isUserCandidate && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setCandidateDialogOpen(true)}
              disabled={isCandidateLoading}
            >
              {isCandidateLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {t('features.events.agenda.becomeCandidate')}
            </Button>
          </div>
        )}

        {/* Withdraw Candidacy */}
        {!isCompleted && isUserCandidate && onWithdrawCandidacy && (
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={onWithdrawCandidacy}
              disabled={isCandidateLoading}
            >
              {t('features.events.agenda.withdrawCandidacy')}
            </Button>
          </div>
        )}
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
            <DialogDescription>{positionName}</DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={selectedCandidate.user?.avatar}
                  alt={selectedCandidate.user?.name}
                />
                <AvatarFallback>
                  {selectedCandidate.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedCandidate.user?.name || selectedCandidate.user?.email || 'Unknown'}
                </p>
                {selectedCandidate.user?.email && selectedCandidate.user?.name && (
                  <p className="text-sm text-muted-foreground">{selectedCandidate.user.email}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button onClick={handleConfirmVote} disabled={isVotingLoading}>
              {isVotingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Become Candidate Confirmation Dialog */}
      <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.events.agenda.becomeCandidateTitle')}</DialogTitle>
            <DialogDescription>
              {t('features.events.agenda.becomeCandidateDescription', { position: positionName })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCandidateDialogOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button onClick={handleBecomeCandidate} disabled={isCandidateLoading}>
              {isCandidateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vote Selection Dialog - Candidate List */}
      <Dialog open={voteSelectionDialogOpen} onOpenChange={setVoteSelectionDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              {isIndicationPhase
                ? t('features.events.agenda.selectCandidateIndication')
                : t('features.events.agenda.selectCandidate')}
            </DialogTitle>
            <DialogDescription>{positionName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {visibleCandidates.map(candidate => {
              const isCurrentSelection = selectedCandidateId === candidate.id;
              const candidateStats = stats.find(s => s.candidateId === candidate.id);

              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                    isCurrentSelection && 'border-primary bg-primary/10'
                  )}
                  onClick={() => handleSelectCandidateForVote(candidate.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.user?.avatar} alt={candidate.user?.name} />
                    <AvatarFallback>
                      {candidate.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {candidate.user?.name || candidate.user?.email || 'Unknown'}
                      </p>
                      <Badge
                        variant={candidate.status === 'accepted' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {candidate.status === 'accepted'
                          ? t('features.events.agenda.candidateAccepted')
                          : t('features.events.agenda.candidateNominated')}
                      </Badge>
                    </div>
                    {candidateStats && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isIndicationPhase
                          ? `${candidateStats.indicationCount} ${t('features.events.agenda.indicationVotes')}`
                          : `${candidateStats.actualCount} ${t('features.events.agenda.votes')}`}
                      </p>
                    )}
                  </div>
                  {isCurrentSelection && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteSelectionDialogOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              onClick={handleConfirmVoteFromSelection}
              disabled={!selectedCandidateId || isVotingLoading}
            >
              {t('common.actions.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
