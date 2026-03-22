'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Button } from '@/features/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Vote, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { VotePasswordInput } from './VotePasswordInput';
import { VotePhaseBadge } from './VotePhaseBadge';
import type { VotingPhase } from '../logic/votePhaseHelpers';

// ─── Types ───────────────────────────────────────────────────────────

interface Candidate {
  id: string;
  name: string;
  avatar?: string;
}

interface VoteChoice {
  id: string;
  label: string;
}

interface VoteCastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: VotingPhase;

  /** For elections — list of candidates */
  candidates?: Candidate[];
  /** For elections — max selectable candidates (default 1) */
  maxVotes?: number;

  /** For votes — dynamic list of choices */
  choices?: VoteChoice[];

  title?: string;

  /** Password confirmation */
  requirePassword?: boolean;
  passwordError?: string | null;
  isPasswordVerifying?: boolean;

  /** Callbacks */
  onCastVote?: (choiceId: string) => Promise<void>;
  onCastElectionVote?: (candidateIds: string[]) => Promise<void>;
  onPasswordSubmit?: (password: string) => void;

  isLoading?: boolean;
}

type DialogStep = 'choice' | 'confirm' | 'password';

/**
 * Reusable vote-casting dialog.
 *
 * Flow:
 * 1. Choose vote option (candidate(s) or choice)
 * 2. Confirm selection
 * 3. (optional) Enter voting password → auto-submit on correct 4 digits
 * 4. Dialog closes
 */
export function VoteCastDialog({
  open,
  onOpenChange,
  phase,
  candidates,
  maxVotes = 1,
  choices,
  title,
  requirePassword,
  passwordError,
  isPasswordVerifying,
  onCastVote,
  onCastElectionVote,
  onPasswordSubmit,
  isLoading,
}: VoteCastDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<DialogStep>('choice');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const isElection = candidates && candidates.length > 0;
  const isMultiSelect = isElection && maxVotes > 1;

  const handleReset = useCallback(() => {
    setStep('choice');
    setSelectedChoiceId(null);
    setSelectedCandidateIds([]);
  }, []);

  const handleOpenChange = (value: boolean) => {
    if (!value) handleReset();
    onOpenChange(value);
  };

  const submitVote = async () => {
    if (isElection && selectedCandidateIds.length > 0 && onCastElectionVote) {
      await onCastElectionVote(selectedCandidateIds);
    } else if (selectedChoiceId && onCastVote) {
      await onCastVote(selectedChoiceId);
    }
    handleReset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (requirePassword) {
      setStep('password');
      return;
    }
    await submitVote();
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      if (onPasswordSubmit) {
        await onPasswordSubmit(password);
      }
      await submitVote();
    } catch {
      // Error toast is handled by the password verification hook
    }
  };

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (isMultiSelect) {
        if (prev.length >= maxVotes) return prev;
        return [...prev, candidateId];
      }
      // Single select — replace
      return [candidateId];
    });
  };

  const hasSelection = isElection ? selectedCandidateIds.length > 0 : !!selectedChoiceId;

  const selectedCandidates = candidates?.filter((c) => selectedCandidateIds.includes(c.id)) ?? [];
  const selectedChoice = choices?.find((c) => c.id === selectedChoiceId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {step === 'password'
              ? t('features.events.voting.confirmWithPassword', 'Confirm with PIN')
              : t('features.events.voting.castVote', 'Cast Vote')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {title}
            <VotePhaseBadge phase={phase} />
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Choice */}
        {step === 'choice' && (
          <div className="space-y-3 py-4">
            {isElection && candidates ? (
              // Election: candidate list (single or multi-select)
              <>
                {isMultiSelect && (
                  <p className="text-sm text-muted-foreground">
                    {t('features.events.voting.selectUpTo', `Select up to ${maxVotes} candidates`)}
                    {' '}({selectedCandidateIds.length}/{maxVotes})
                  </p>
                )}
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidateIds.includes(candidate.id);
                  return (
                    <div
                      key={candidate.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        isSelected && 'border-primary bg-primary/10',
                      )}
                      onClick={() => toggleCandidate(candidate.id)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback>
                          {candidate.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 font-medium">{candidate.name}</span>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  );
                })}
              </>
            ) : choices && choices.length > 0 ? (
              // Vote: dynamic choice list
              <div className="grid gap-3">
                {choices.map((choice) => (
                  <Button
                    key={choice.id}
                    size="lg"
                    variant={selectedChoiceId === choice.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedChoiceId(choice.id)}
                  >
                    {selectedChoiceId === choice.id && (
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    )}
                    {choice.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Confirm preview (shown inline when choice is made) */}
        {step === 'choice' && hasSelection && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t('features.events.voting.yourChoice', 'Your choice')}:
            </p>
            {isElection && selectedCandidates.length > 0 ? (
              <div className="space-y-2">
                {selectedCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback>{c.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            ) : selectedChoice ? (
              <span className="font-medium">{selectedChoice.label}</span>
            ) : null}
          </div>
        )}

        {/* Step 3: Password */}
        {step === 'password' && (
          <div className="py-4">
            <VotePasswordInput
              onSubmit={handlePasswordSubmit}
              error={passwordError}
              isLoading={isPasswordVerifying}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          {step === 'choice' && (
            <Button
              onClick={handleConfirm}
              disabled={isLoading || !hasSelection}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.actions.confirm')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
