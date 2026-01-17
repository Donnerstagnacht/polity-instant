'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Clock,
  GripVertical,
  FileText,
} from 'lucide-react';
import db, { tx } from '../../../../db/db';
import { toast } from 'sonner';

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  proposedChange: string;
  characterCount?: number;
  votingOrder?: number;
  status: string;
  source?: string;
  createdAt: number;
  creator?: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

interface VoteSession {
  id: string;
  status: string;
  votingStartTime: number;
  votingEndTime: number;
  currentChangeRequestIndex?: number;
  votes?: Array<{
    id: string;
    vote: string;
    voter: {
      id: string;
      name?: string;
    };
  }>;
}

interface AmendmentVotingQueueProps {
  amendmentId: string;
  eventId: string;
  agendaItemId: string;
  changeRequests: ChangeRequest[];
  currentSession?: VoteSession;
  isOrganizer: boolean;
  onAdvanceToNext: () => void;
  onComplete: () => void;
}

function ChangeRequestItem({
  changeRequest,
  index,
  isActive,
  isCompleted,
  isOrganizer,
  voteResults,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  changeRequest: ChangeRequest;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isOrganizer: boolean;
  voteResults?: { accept: number; reject: number; abstain: number };
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {

  const totalVotes = voteResults
    ? voteResults.accept + voteResults.reject + voteResults.abstain
    : 0;
  const acceptPercentage = totalVotes > 0 ? (voteResults!.accept / totalVotes) * 100 : 0;

  return (
    <div
      className={`rounded-lg border p-4 ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : isCompleted
            ? 'border-gray-300 bg-gray-50 dark:bg-gray-900'
            : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {isOrganizer && !isCompleted && (
          <div className="mt-1 flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-6 w-6 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-6 w-6 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
              <h4 className="font-semibold">{changeRequest.title}</h4>
              {isActive && (
                <Badge variant="default" className="bg-blue-500">
                  Aktuelle Abstimmung
                </Badge>
              )}
              {isCompleted && voteResults && (
                <Badge
                  variant={acceptPercentage > 50 ? 'default' : 'secondary'}
                  className={acceptPercentage > 50 ? 'bg-green-500' : 'bg-red-500'}
                >
                  {acceptPercentage > 50 ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Angenommen
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Abgelehnt
                    </>
                  )}
                </Badge>
              )}
            </div>
            <Badge variant="outline">
              {changeRequest.characterCount || 0} Zeichen geändert
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{changeRequest.description}</p>

          {changeRequest.creator && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Vorgeschlagen von {changeRequest.creator.name || 'Unbekannt'}
              </span>
              {changeRequest.source && (
                <Badge variant="outline" className="text-xs">
                  {changeRequest.source === 'collaborator' ? 'Collaborator' : 'Event-Teilnehmer'}
                </Badge>
              )}
            </div>
          )}

          {isCompleted && voteResults && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span>Zustimmung: {voteResults.accept}</span>
                <span>Ablehnung: {voteResults.reject}</span>
                <span>Enthaltung: {voteResults.abstain}</span>
              </div>
              <Progress value={acceptPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {acceptPercentage.toFixed(1)}% Zustimmung ({totalVotes} Stimmen)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AmendmentVotingQueue({
  amendmentId,
  eventId,
  agendaItemId,
  changeRequests,
  currentSession,
  isOrganizer,
  onAdvanceToNext,
  onComplete,
}: AmendmentVotingQueueProps) {
  const [localChangeRequests, setLocalChangeRequests] = useState(changeRequests);

  // Sort change requests by votingOrder (if set) or characterCount
  const sortedChangeRequests = useMemo(() => {
    return [...localChangeRequests].sort((a, b) => {
      if (a.votingOrder !== undefined && b.votingOrder !== undefined) {
        return a.votingOrder - b.votingOrder;
      }
      if (a.votingOrder !== undefined) return -1;
      if (b.votingOrder !== undefined) return 1;
      return (b.characterCount || 0) - (a.characterCount || 0);
    });
  }, [localChangeRequests]);

  const currentIndex = currentSession?.currentChangeRequestIndex || 0;
  const totalRequests = sortedChangeRequests.length;
  const progress = totalRequests > 0 ? ((currentIndex + 1) / (totalRequests + 1)) * 100 : 0;

  const timeRemaining = currentSession
    ? Math.max(0, currentSession.votingEndTime - Date.now())
    : 0;
  const minutesRemaining = Math.floor(timeRemaining / 60000);
  const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newOrder = [...sortedChangeRequests];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;

    await updateVotingOrder(newOrder);
  };

  const handleMoveDown = async (index: number) => {
    if (index === sortedChangeRequests.length - 1) return;

    const newOrder = [...sortedChangeRequests];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;

    await updateVotingOrder(newOrder);
  };

  const updateVotingOrder = async (newOrder: ChangeRequest[]) => {
    try {
      const updates = newOrder.map((cr: ChangeRequest, index: number) =>
        tx.changeRequests[cr.id].update({ votingOrder: index })
      );

      await db.transact(updates);

      setLocalChangeRequests(newOrder);
      toast.success('Abstimmungsreihenfolge aktualisiert');
    } catch (error) {
      console.error('Failed to update voting order:', error);
      toast.error('Fehler beim Aktualisieren der Reihenfolge');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Abstimmungs-Warteschlange
          </CardTitle>
          {currentSession?.status === 'active' && (
            <Badge variant="default" className="gap-1">
              <Clock className="h-3 w-3" />
              {minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')} verbleibend
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Fortschritt: {currentIndex + 1} / {totalRequests + 1}
            </span>
            <span className="text-muted-foreground">
              {currentIndex < totalRequests ? 'Vorschläge' : 'Finale Abstimmung'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Change Requests Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Vorschläge ({totalRequests})</h3>
            {isOrganizer && (
              <p className="text-xs text-muted-foreground">
                ↑↓ zum Neuordnen
              </p>
            )}
          </div>

          <div className="space-y-2">
            {sortedChangeRequests.map((cr, index) => (
              <ChangeRequestItem
                key={cr.id}
                changeRequest={cr}
                index={index}
                isActive={currentIndex === index && currentSession?.status === 'active'}
                isCompleted={index < currentIndex}
                isOrganizer={isOrganizer}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < sortedChangeRequests.length - 1}
                voteResults={
                  index < currentIndex
                    ? { accept: 10, reject: 5, abstain: 2 } // TODO: Load real vote results
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        {/* Final Text Vote */}
        {currentIndex >= totalRequests && (
          <div
            className={`rounded-lg border-2 p-4 ${
              currentSession?.status === 'active'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Finale Textabstimmung</h4>
                <p className="text-sm text-muted-foreground">
                  Abstimmung über den gesamten Amendment-Text
                </p>
              </div>
              {currentSession?.status === 'active' && (
                <Badge variant="default" className="bg-green-500">
                  Aktuelle Abstimmung
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Organizer Controls */}
        {isOrganizer && currentSession?.status === 'active' && (
          <div className="flex gap-2 pt-4">
            {currentIndex < totalRequests ? (
              <Button onClick={onAdvanceToNext} className="flex-1">
                <ArrowDown className="mr-2 h-4 w-4" />
                Nächster Vorschlag
              </Button>
            ) : (
              <Button onClick={onComplete} variant="default" className="flex-1 bg-green-600">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Abstimmung Abschließen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
