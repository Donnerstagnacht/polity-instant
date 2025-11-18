'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventNav } from '@/components/layout/event-nav';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  User,
  ArrowLeft,
  Gavel,
  FileText,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
  Edit,
  Trash2,
  BarChart3,
  AlertCircle,
  Plus,
  Mic,
} from 'lucide-react';
import { db, id, tx } from '../../../../../db';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AgendaItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const agendaItemId = params.agenda_item_id as string;
  const { user } = db.useAuth();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingSpeaker, setAddingSpeaker] = useState(false);

  // Query agenda item with all related data
  const { data, isLoading } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          id: agendaItemId,
        },
      },
      creator: {},
      event: {
        organizer: {},
      },
      election: {
        candidates: {},
        votes: {},
      },
      amendmentVote: {
        changeRequests: {},
        voteEntries: {},
      },
      speakerList: {
        user: {},
      },
    },
    electionVotes: {
      voter: {},
      candidate: {},
      election: {},
    },
    amendmentVoteEntries: {
      voter: {},
      amendmentVote: {},
    },
  });

  const agendaItem = data?.agendaItems?.[0];
  const event = agendaItem?.event;

  // Get user's existing votes
  const userElectionVotes = (data?.electionVotes || []).filter(
    (vote: any) => vote.voter?.id === user?.id
  );
  const userAmendmentVotes = (data?.amendmentVoteEntries || []).filter(
    (entry: any) => entry.voter?.id === user?.id
  );

  // Handle election vote
  const handleElectionVote = async (electionId: string, candidateId: string) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      const existingVote = userElectionVotes.find((vote: any) => vote.election?.id === electionId);

      if (existingVote) {
        if (existingVote.candidate?.id === candidateId) {
          await db.transact([tx.electionVotes[existingVote.id].delete()]);
        } else {
          const newVoteId = id();
          await db.transact([
            tx.electionVotes[existingVote.id].delete(),
            tx.electionVotes[newVoteId]
              .update({
                createdAt: Date.now(),
              })
              .link({
                voter: user.id,
                election: electionId,
                candidate: candidateId,
              }),
          ]);
        }
      } else {
        const voteId = id();
        await db.transact([
          tx.electionVotes[voteId]
            .update({
              createdAt: Date.now(),
            })
            .link({
              voter: user.id,
              election: electionId,
              candidate: candidateId,
            }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle amendment vote
  const handleAmendmentVote = async (
    amendmentVoteId: string,
    voteValue: 'yes' | 'no' | 'abstain'
  ) => {
    if (!user) return;

    setVotingLoading(amendmentVoteId);
    try {
      const existingVote = userAmendmentVotes.find(
        (entry: any) => entry.amendmentVote?.id === amendmentVoteId
      );

      if (existingVote) {
        await db.transact([
          tx.amendmentVoteEntries[existingVote.id].update({
            vote: voteValue,
            updatedAt: Date.now(),
          }),
        ]);
      } else {
        const entryId = id();
        await db.transact([
          tx.amendmentVoteEntries[entryId]
            .update({
              vote: voteValue,
              createdAt: Date.now(),
            })
            .link({
              voter: user.id,
              amendmentVote: amendmentVoteId,
            }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle delete agenda item
  const handleDelete = async () => {
    if (!user || !agendaItem) return;

    setDeleteLoading(true);
    try {
      await db.transact([tx.agendaItems[agendaItemId].delete()]);
      router.push(`/event/${eventId}/agenda`);
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !agendaItemId) return;

    setAddingSpeaker(true);
    try {
      // Find the maximum order value
      const speakerList = agendaItem?.speakerList || [];
      const maxOrder =
        speakerList.length > 0 ? Math.max(...speakerList.map((s: any) => s.order || 0)) : 0;

      const speakerId = id();
      await db.transact([
        tx.speakerList[speakerId].update({
          title: 'Speaker',
          time: 3, // Default 3 minutes
          completed: false,
          order: maxOrder + 1,
          createdAt: new Date(),
        }),
        tx.speakerList[speakerId].link({
          user: user.id,
          agendaItem: agendaItemId,
        }),
      ]);
    } catch (error) {
      console.error('Error adding to speaker list:', error);
    } finally {
      setAddingSpeaker(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 animate-pulse rounded bg-muted"></div>
          <div className="h-64 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!agendaItem || !event) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Tagesordnungspunkt nicht gefunden</h2>
            <p className="mb-4 text-muted-foreground">
              Der gesuchte Tagesordnungspunkt existiert nicht oder wurde gelöscht.
            </p>
            <Button asChild>
              <Link href={`/event/${eventId}/agenda`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Tagesordnung
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAgendaItemIcon = (type: string) => {
    switch (type) {
      case 'election':
        return <UserCheck className="h-5 w-5" />;
      case 'vote':
        return <Vote className="h-5 w-5" />;
      case 'speech':
        return <Users className="h-5 w-5" />;
      case 'discussion':
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'election':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'vote':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'speech':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'discussion':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const isCreator = user?.id === agendaItem.creator?.id;
  const isEventOrganizer = user?.id === event.organizer?.id;
  const canEdit = isCreator || isEventOrganizer;

  // Check if user is already in speaker list
  const speakerList = agendaItem?.speakerList || [];
  const isUserInSpeakerList = speakerList.some((speaker: any) => speaker.user?.id === user?.id);

  return (
    <AuthGuard>
      <PageWrapper>
        <EventNav eventId={eventId} />

        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/event/${eventId}`} className="hover:underline">
              {event.title}
            </Link>
            <span>/</span>
            <Link href={`/event/${eventId}/agenda`} className="hover:underline">
              Tagesordnung
            </Link>
            <span>/</span>
            <span className="text-foreground">{agendaItem.title}</span>
          </div>

          {/* Agenda Item Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getAgendaItemIcon(agendaItem.type)}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{agendaItem.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(agendaItem.type)}>
                        <span className="capitalize">{agendaItem.type}</span>
                      </Badge>
                      <Badge className={getStatusColor(agendaItem.status)}>
                        {agendaItem.status}
                      </Badge>
                      {agendaItem.duration && (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {agendaItem.duration} Minuten
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={deleteLoading}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tagesordnungspunkt löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Der
                            Tagesordnungspunkt und alle zugehörigen Daten werden dauerhaft gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                            {deleteLoading ? 'Wird gelöscht...' : 'Löschen'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>

            {agendaItem.description && (
              <CardContent className="pt-0">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {agendaItem.description}
                  </p>
                </div>
              </CardContent>
            )}

            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Erstellt von:</span>
                  <span className="font-medium">
                    {agendaItem.creator?.name || agendaItem.creator?.email || 'Unbekannt'}
                  </span>
                </div>
                {agendaItem.startTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Startzeit:</span>
                    <span className="font-medium">
                      {new Date(agendaItem.startTime).toLocaleString('de-DE')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Event:</span>
                  <Link href={`/event/${eventId}`} className="font-medium hover:underline">
                    {event.title}
                  </Link>
                </div>
              </div>

              {/* Speaker List Button */}
              <div className="w-full border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Rednerliste</span>
                    {speakerList.length > 0 && (
                      <Badge variant="secondary">{speakerList.length} Redner</Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleAddToSpeakerList}
                    disabled={isUserInSpeakerList || !user || addingSpeaker}
                    variant={isUserInSpeakerList ? 'outline' : 'default'}
                  >
                    {isUserInSpeakerList ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Bereits eingetragen
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {addingSpeaker ? 'Wird hinzugefügt...' : 'Zur Rednerliste hinzufügen'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Election Section */}
          {agendaItem.election && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vote className="h-5 w-5" />
                    <CardTitle>Wahl</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {agendaItem.election.majorityType === 'absolute'
                      ? 'Absolute Mehrheit'
                      : 'Relative Mehrheit'}
                  </Badge>
                </div>
                <CardDescription>{agendaItem.election.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {agendaItem.election.description && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      {agendaItem.election.description}
                    </p>
                  </div>
                )}

                {(() => {
                  const election = agendaItem.election;
                  const userVote = userElectionVotes.find(
                    (vote: any) => vote.election?.id === election.id
                  );
                  const candidates = election.candidates || [];

                  // Get all votes for this election
                  const electionVotes = (data?.electionVotes || []).filter(
                    (vote: any) => vote.election?.id === election.id
                  );

                  // Count votes for each candidate
                  const voteCounts: Record<string, number> = {};
                  electionVotes.forEach((vote: any) => {
                    const candId = vote.candidate?.id;
                    if (candId) {
                      voteCounts[candId] = (voteCounts[candId] || 0) + 1;
                    }
                  });

                  const totalVotes = electionVotes.length;
                  const maxVotes = Math.max(...Object.values(voteCounts), 0);

                  return (
                    <>
                      {/* Vote Statistics */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-4 text-center">
                          <div className="text-2xl font-bold">{totalVotes}</div>
                          <div className="text-sm text-muted-foreground">Abgegebene Stimmen</div>
                        </div>
                        <div className="rounded-lg border bg-card p-4 text-center">
                          <div className="text-2xl font-bold">{candidates.length}</div>
                          <div className="text-sm text-muted-foreground">Kandidaten</div>
                        </div>
                        <div className="rounded-lg border bg-card p-4 text-center">
                          <div className="text-2xl font-bold">{election.status || 'Geplant'}</div>
                          <div className="text-sm text-muted-foreground">Status</div>
                        </div>
                      </div>

                      {/* Candidates List */}
                      {candidates.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Kandidaten</h3>
                            {userVote && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Sie haben gewählt
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-3">
                            {candidates
                              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                              .map((candidate: any) => {
                                const voteCount = voteCounts[candidate.id] || 0;
                                const isVoted = userVote?.candidate?.id === candidate.id;
                                const percentage =
                                  totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                const isLeading = voteCount === maxVotes && maxVotes > 0;

                                return (
                                  <div
                                    key={candidate.id}
                                    className={`relative overflow-hidden rounded-lg border p-4 transition-all ${
                                      isVoted ? 'border-primary bg-primary/5' : ''
                                    }`}
                                  >
                                    {/* Progress bar background */}
                                    <div
                                      className="absolute inset-0 bg-muted/30 transition-all"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />

                                    <div className="relative flex items-center justify-between gap-4">
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold">{candidate.name}</h4>
                                          {isLeading && totalVotes > 0 && (
                                            <Badge variant="default" className="text-xs">
                                              <BarChart3 className="mr-1 h-3 w-3" />
                                              Führend
                                            </Badge>
                                          )}
                                          {isVoted && (
                                            <Badge variant="default" className="text-xs">
                                              <CheckCircle2 className="mr-1 h-3 w-3" />
                                              Ihre Wahl
                                            </Badge>
                                          )}
                                        </div>
                                        {candidate.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {candidate.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                          <Badge variant="outline">
                                            {voteCount} {voteCount === 1 ? 'Stimme' : 'Stimmen'}
                                          </Badge>
                                          {totalVotes > 0 && (
                                            <span className="text-muted-foreground">
                                              {percentage.toFixed(1)}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        size="lg"
                                        variant={isVoted ? 'default' : 'outline'}
                                        onClick={() =>
                                          handleElectionVote(election.id, candidate.id)
                                        }
                                        disabled={votingLoading === election.id || !user}
                                      >
                                        <Vote className="mr-2 h-4 w-4" />
                                        {isVoted ? 'Gewählt' : 'Wählen'}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                          <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Noch keine Kandidaten hinzugefügt
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Amendment Vote Section */}
          {agendaItem.amendmentVote && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  <CardTitle>Abstimmung</CardTitle>
                </div>
                <CardDescription>{agendaItem.amendmentVote.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {agendaItem.amendmentVote.description && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      {agendaItem.amendmentVote.description}
                    </p>
                  </div>
                )}

                {(() => {
                  const amendmentVote = agendaItem.amendmentVote;
                  const userVote = userAmendmentVotes.find(
                    (entry: any) => entry.amendmentVote?.id === amendmentVote.id
                  );

                  // Get all vote entries for this amendment vote
                  const voteEntries = (data?.amendmentVoteEntries || []).filter(
                    (entry: any) => entry.amendmentVote?.id === amendmentVote.id
                  );

                  // Count votes
                  const voteCounts = {
                    yes: voteEntries.filter((e: any) => e.vote === 'yes').length,
                    no: voteEntries.filter((e: any) => e.vote === 'no').length,
                    abstain: voteEntries.filter((e: any) => e.vote === 'abstain').length,
                  };
                  const totalVotes = voteCounts.yes + voteCounts.no + voteCounts.abstain;

                  return (
                    <>
                      {/* Vote Statistics */}
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-lg border bg-card p-4 text-center">
                          <div className="text-2xl font-bold">{totalVotes}</div>
                          <div className="text-sm text-muted-foreground">Gesamt</div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {voteCounts.yes}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">Ja</div>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950">
                          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {voteCounts.no}
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-400">Nein</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
                          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {voteCounts.abstain}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Enthalten</div>
                        </div>
                      </div>

                      {/* Vote Percentages */}
                      {totalVotes > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Ergebnisse in Prozent</h3>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-green-600 dark:text-green-400">Ja</span>
                                <span className="font-medium">
                                  {((voteCounts.yes / totalVotes) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-green-600 transition-all dark:bg-green-400"
                                  style={{
                                    width: `${(voteCounts.yes / totalVotes) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-red-600 dark:text-red-400">Nein</span>
                                <span className="font-medium">
                                  {((voteCounts.no / totalVotes) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-red-600 transition-all dark:bg-red-400"
                                  style={{
                                    width: `${(voteCounts.no / totalVotes) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Enthalten</span>
                                <span className="font-medium">
                                  {((voteCounts.abstain / totalVotes) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-gray-600 transition-all dark:bg-gray-400"
                                  style={{
                                    width: `${(voteCounts.abstain / totalVotes) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Voting Interface */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Ihre Stimme abgeben</h3>
                          {userVote && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Sie haben mit{' '}
                              <span className="ml-1 font-medium">
                                {userVote.vote === 'yes'
                                  ? 'Ja'
                                  : userVote.vote === 'no'
                                    ? 'Nein'
                                    : 'Enthalten'}
                              </span>{' '}
                              gestimmt
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Button
                            variant={userVote?.vote === 'yes' ? 'default' : 'outline'}
                            size="lg"
                            onClick={() => handleAmendmentVote(amendmentVote.id, 'yes')}
                            disabled={votingLoading === amendmentVote.id || !user}
                            className={
                              userVote?.vote === 'yes'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                            }
                          >
                            <ThumbsUp className="mr-2 h-5 w-5" />
                            Ja
                          </Button>
                          <Button
                            variant={userVote?.vote === 'no' ? 'default' : 'outline'}
                            size="lg"
                            onClick={() => handleAmendmentVote(amendmentVote.id, 'no')}
                            disabled={votingLoading === amendmentVote.id || !user}
                            className={
                              userVote?.vote === 'no'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                            }
                          >
                            <ThumbsDown className="mr-2 h-5 w-5" />
                            Nein
                          </Button>
                          <Button
                            variant={userVote?.vote === 'abstain' ? 'default' : 'outline'}
                            size="lg"
                            onClick={() => handleAmendmentVote(amendmentVote.id, 'abstain')}
                            disabled={votingLoading === amendmentVote.id || !user}
                            className={
                              userVote?.vote === 'abstain'
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                            }
                          >
                            <Minus className="mr-2 h-5 w-5" />
                            Enthalten
                          </Button>
                        </div>
                      </div>

                      {/* Change Requests */}
                      {amendmentVote.changeRequests && amendmentVote.changeRequests.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold">
                            Änderungsanträge ({amendmentVote.changeRequests.length})
                          </h3>
                          <div className="space-y-2">
                            {amendmentVote.changeRequests.map((request: any, index: number) => (
                              <div
                                key={request.id || index}
                                className="rounded-lg border bg-card p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        #{index + 1}
                                      </Badge>
                                      <h4 className="font-medium">{request.title}</h4>
                                    </div>
                                    {request.description && (
                                      <p className="mt-2 text-sm text-muted-foreground">
                                        {request.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Weitere Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Typ</h4>
                  <Badge className={getTypeColor(agendaItem.type)}>
                    <span className="capitalize">{agendaItem.type}</span>
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge className={getStatusColor(agendaItem.status)}>{agendaItem.status}</Badge>
                </div>
                {agendaItem.duration && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Dauer</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{agendaItem.duration} Minuten</span>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Reihenfolge</h4>
                  <span>Position {agendaItem.order}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href={`/event/${eventId}/agenda`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Tagesordnung
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/event/${eventId}`}>Zum Event</Link>
            </Button>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
