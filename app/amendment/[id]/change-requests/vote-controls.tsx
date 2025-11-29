'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Minus } from 'lucide-react';
import { db, tx, id } from '../../../../db';
import { useToast } from '@/global-state/use-toast';

interface VoteControlsProps {
  changeRequestId: string;
  currentUserId: string;
  votes: {
    id: string;
    vote: string;
    createdAt: number;
    voter: {
      id: string;
      user?: {
        name?: string;
        avatar?: string;
      };
    };
  }[];
  collaborators: {
    id: string;
    user: {
      id: string;
      name?: string;
      avatar?: string;
    };
  }[];
  status: string;
  amendmentId: string; // Need this to create changeRequest entity
  documentId: string; // Need this to find/create changeRequest entity
  suggestionData?: {
    // Data from the discussion to create changeRequest if needed
    crId: string;
    description: string;
    proposedChange: string;
    justification: string;
    userId: string;
    createdAt: number;
  };
  onVoteComplete?: () => void;
}

export function VoteControls({
  changeRequestId,
  currentUserId,
  votes,
  collaborators,
  status,
  amendmentId,
  suggestionData,
  onVoteComplete,
}: VoteControlsProps) {
  const [isVoting, setIsVoting] = useState(false);
  // Helper function to check if a string is a valid UUID
  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Only use changeRequestId if it's a valid UUID, otherwise we'll create one
  const [actualChangeRequestId, setActualChangeRequestId] = useState<string | null>(
    isUUID(changeRequestId) ? changeRequestId : null
  );
  const { toast } = useToast();

  // Check if current user has already voted
  const currentUserVote = votes.find(v => v.voter?.id === currentUserId);
  const hasVoted = !!currentUserVote;

  // Calculate vote counts
  const acceptVotes = votes.filter(v => v.vote === 'accept').length;
  const rejectVotes = votes.filter(v => v.vote === 'reject').length;
  const abstainVotes = votes.filter(v => v.vote === 'abstain').length;
  const totalVotes = votes.length;
  const totalCollaborators = collaborators.length;

  // Get who hasn't voted yet
  const votedUserIds = new Set(votes.map(v => v.voter?.id));
  const notVotedYet = collaborators.filter(c => !votedUserIds.has(c.user?.id));

  const handleVote = async (voteType: 'accept' | 'reject' | 'abstain') => {
    if (hasVoted) {
      toast({
        title: 'Already Voted',
        description: 'You have already cast your vote on this change request.',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);

    try {
      // If this is an "open" request (from discussions), we need to create a changeRequest entity first
      let crId = actualChangeRequestId;

      if (suggestionData && !actualChangeRequestId) {
        // Create the changeRequest entity
        crId = id(); // Generate a new UUID

        await db.transact([
          tx.changeRequests[crId]
            .update({
              title: suggestionData.crId,
              description: suggestionData.description,
              proposedChange: suggestionData.proposedChange,
              justification: suggestionData.justification,
              status: 'pending', // Pending vote
              requiresVoting: true,
              createdAt: suggestionData.createdAt,
              updatedAt: Date.now(),
            })
            .link({ creator: suggestionData.userId })
            .link({ amendment: amendmentId }),
        ]);

        setActualChangeRequestId(crId);
      }

      if (!crId) {
        throw new Error('Could not determine changeRequest ID');
      }

      const voteId = id();

      await db.transact([
        tx.changeRequestVotes[voteId]
          .update({
            vote: voteType,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ changeRequest: crId })
          .link({ voter: currentUserId }),
      ]);

      toast({
        title: 'Vote Recorded',
        description: `You voted to ${voteType} this change request.`,
      });

      if (onVoteComplete) {
        onVoteComplete();
      }
    } catch (error) {
      console.error('Failed to record vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Don't show voting controls if the CR is already resolved
  if (status === 'accepted' || status === 'rejected') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Voting Buttons */}
      {!hasVoted ? (
        <div className="flex gap-2">
          <Button
            onClick={() => handleVote('accept')}
            disabled={isVoting}
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            onClick={() => handleVote('reject')}
            disabled={isVoting}
            variant="destructive"
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => handleVote('abstain')}
            disabled={isVoting}
            variant="outline"
            className="flex-1"
          >
            <Minus className="mr-2 h-4 w-4" />
            Abstain
          </Button>
        </div>
      ) : (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="py-3">
            <p className="text-sm">
              You voted to <strong className="capitalize">{currentUserVote.vote}</strong> this
              change request
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vote Summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold">Voting Progress</h4>
          <Badge variant="secondary">
            {totalVotes} / {totalCollaborators} voted
          </Badge>
        </div>

        {/* Vote Bars */}
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600" />
                Accept
              </span>
              <span className="font-semibold">{acceptVotes}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-green-600 transition-all"
                style={{
                  width:
                    totalCollaborators > 0 ? `${(acceptVotes / totalCollaborators) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <X className="h-3 w-3 text-red-600" />
                Reject
              </span>
              <span className="font-semibold">{rejectVotes}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width:
                    totalCollaborators > 0 ? `${(rejectVotes / totalCollaborators) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Minus className="h-3 w-3 text-gray-600" />
                Abstain
              </span>
              <span className="font-semibold">{abstainVotes}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gray-600 transition-all"
                style={{
                  width:
                    totalCollaborators > 0 ? `${(abstainVotes / totalCollaborators) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Who Voted */}
        {votes.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="mb-2 text-sm font-semibold">Voted:</p>
            <div className="flex flex-wrap gap-2">
              {votes.map(vote => (
                <div
                  key={vote.id}
                  className="flex items-center gap-1 rounded-full bg-background px-2 py-1 text-xs"
                >
                  <Avatar className="h-5 w-5">
                    {vote.voter?.user ? (
                      <AvatarImage src={vote.voter.user.avatar} alt={vote.voter.user.name || ''} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {vote.voter?.user?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{vote.voter?.user?.name || 'Unknown'}</span>
                  <Badge
                    variant="outline"
                    className={`ml-1 ${
                      vote.vote === 'accept'
                        ? 'border-green-600 text-green-600'
                        : vote.vote === 'reject'
                          ? 'border-red-600 text-red-600'
                          : 'border-gray-600 text-gray-600'
                    }`}
                  >
                    {vote.vote}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Who Hasn't Voted */}
        {notVotedYet.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              Waiting for ({notVotedYet.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {notVotedYet.map(collab => (
                <div
                  key={collab.id}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs opacity-60"
                >
                  <Avatar className="h-5 w-5">
                    {collab.user?.avatar ? (
                      <AvatarImage src={collab.user.avatar} alt={collab.user.name || ''} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {collab.user?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{collab.user?.name || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
