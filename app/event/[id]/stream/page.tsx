'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  FileText,
  Users,
  Vote,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { db, id, tx } from '../../../../db/db';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export default function EventStreamPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user } = db.useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Query event and agenda items
  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      organizer: {},
      agendaItems: {
        creator: {},
        speakerList: {
          user: {},
        },
        election: {
          candidates: {},
          votes: {},
        },
        amendmentVote: {
          changeRequests: {},
          voteEntries: {},
        },
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

  const event = data?.events?.[0];

  // Get current agenda item (in-progress or first pending)
  const agendaItems = event?.agendaItems || [];
  const currentAgendaItem =
    agendaItems.find((item: any) => item.status === 'in-progress') ||
    agendaItems.find((item: any) => item.status === 'pending') ||
    agendaItems.sort((a: any, b: any) => a.order - b.order)[0];

  // Get speaker list for current agenda item, sorted by order
  const speakerList = currentAgendaItem?.speakerList
    ? [...currentAgendaItem.speakerList].sort((a: any, b: any) => a.order - b.order)
    : [];

  // Calculate current time and speaker times
  const getCurrentTime = () => new Date();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateSpeakerTime = (index: number) => {
    const startTime = currentAgendaItem?.startTime
      ? new Date(currentAgendaItem.startTime)
      : currentTime;

    let accumulatedMinutes = 0;
    for (let i = 0; i < index; i++) {
      accumulatedMinutes += speakerList[i]?.time || 0;
    }

    const speakerTime = new Date(startTime.getTime() + accumulatedMinutes * 60000);
    return speakerTime;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !currentAgendaItem?.id) return;

    setAddingSpeaker(true);
    try {
      // Find the maximum order value
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
          agendaItem: currentAgendaItem.id,
        }),
      ]);
    } catch (error) {
      console.error('Error adding to speaker list:', error);
    } finally {
      setAddingSpeaker(false);
    }
  };

  // Handle removing yourself from speakers list
  const handleRemoveFromSpeakerList = async (speakerId: string) => {
    if (!user?.id) return;

    setRemovingSpeaker(speakerId);
    try {
      await db.transact([tx.speakerList[speakerId].delete()]);
    } catch (error) {
      console.error('Error removing from speaker list:', error);
    } finally {
      setRemovingSpeaker(null);
    }
  };

  // Check if user is already in speaker list
  const userSpeaker = speakerList.find((speaker: any) => speaker.user?.id === user?.id);

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

  // Carousel scroll handlers
  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
      return () => carousel.removeEventListener('scroll', updateScrollButtons);
    }
  }, [speakerList]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === 'left'
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

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

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading stream...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!event || !currentAgendaItem) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-lg text-muted-foreground">No active agenda item found</p>
            <Button onClick={() => router.push(`/event/${eventId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
            </Button>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            {/* Live Stream Video */}
            {event.streamURL &&
              (() => {
                const videoId = getYouTubeVideoId(event.streamURL);
                return videoId ? (
                  <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-xl">
                    <div className="aspect-video">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                        title="Event Live Stream"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null;
              })()}

            {/* Current Agenda Item */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getAgendaItemIcon(currentAgendaItem.type)}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{currentAgendaItem.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(currentAgendaItem.type)}>
                          <span className="capitalize">{currentAgendaItem.type}</span>
                        </Badge>
                        <Badge className={getStatusColor(currentAgendaItem.status)}>
                          {currentAgendaItem.status}
                        </Badge>
                        {currentAgendaItem.duration && (
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            {currentAgendaItem.duration} Minutes
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/event/${eventId}/agenda/${currentAgendaItem.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              {currentAgendaItem.description && (
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {currentAgendaItem.description}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Election Section */}
            {currentAgendaItem.election && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Vote className="h-5 w-5" />
                      <CardTitle>Wahl</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentAgendaItem.election.description && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        {currentAgendaItem.election.description}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const election = currentAgendaItem.election;
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

                    return (
                      <>
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
            {currentAgendaItem.amendmentVote && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Vote className="h-5 w-5" />
                    <CardTitle>Abstimmung</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentAgendaItem.amendmentVote.description && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        {currentAgendaItem.amendmentVote.description}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const amendmentVote = currentAgendaItem.amendmentVote;
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
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Enthalten
                            </div>
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
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Enthalten
                                  </span>
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
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Speaker List Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Speakers List</CardTitle>
                  {userSpeaker ? (
                    <Button
                      onClick={() => handleRemoveFromSpeakerList(userSpeaker.id)}
                      disabled={removingSpeaker === userSpeaker.id}
                      variant="outline"
                      size="lg"
                    >
                      <X className="mr-2 h-5 w-5" />
                      {removingSpeaker === userSpeaker.id ? 'Removing...' : 'Remove Yourself'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddToSpeakerList}
                      disabled={addingSpeaker || !user}
                      size="lg"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {addingSpeaker ? 'Adding...' : 'Add Yourself'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {speakerList.length === 0 ? (
                  <div className="py-12 text-center">
                    <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No speakers yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Be the first to add yourself to the speakers list
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Carousel Navigation Buttons */}
                    {canScrollLeft && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                        onClick={() => scroll('left')}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                    )}
                    {canScrollRight && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                        onClick={() => scroll('right')}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    )}

                    {/* Carousel */}
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto scroll-smooth px-12 pb-4"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {speakerList.map((speaker: any, index: number) => {
                        const speakerTime = calculateSpeakerTime(index);
                        const speakerName = speaker.user?.name || speaker.user?.email || 'Unknown';
                        const speakerAvatar = speaker.user?.avatar;
                        const isCurrentUser = speaker.user?.id === user?.id;

                        return (
                          <Card
                            key={speaker.id}
                            className={`relative w-64 flex-shrink-0 ${
                              speaker.completed
                                ? 'border-muted opacity-60'
                                : isCurrentUser
                                  ? 'border-2 border-primary'
                                  : 'border-primary'
                            }`}
                          >
                            {isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleRemoveFromSpeakerList(speaker.id)}
                                disabled={removingSpeaker === speaker.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <CardContent className="space-y-4 p-6">
                              {/* Speaker Avatar */}
                              <div className="flex justify-center">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                                  <AvatarImage src={speakerAvatar} />
                                  <AvatarFallback className="text-2xl">
                                    {speakerName[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              {/* Speaker Name */}
                              <div className="text-center">
                                <h3 className="truncate text-lg font-semibold" title={speakerName}>
                                  {speakerName}
                                </h3>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="mt-1">
                                    You
                                  </Badge>
                                )}
                              </div>

                              {/* Speaker Title */}
                              <div className="text-center">
                                <p
                                  className="truncate text-sm text-muted-foreground"
                                  title={speaker.title}
                                >
                                  {speaker.title}
                                </p>
                              </div>

                              {/* Time Badge */}
                              <div className="flex justify-center">
                                <Badge variant="secondary" className="px-4 py-2 text-base">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {formatTime(speakerTime)} ({speaker.time} min)
                                </Badge>
                              </div>

                              {/* Completed Badge */}
                              {speaker.completed && (
                                <div className="flex justify-center">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 dark:bg-green-900"
                                  >
                                    Completed
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
