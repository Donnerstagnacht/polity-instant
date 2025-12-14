'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useParams } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  User,
  Eye,
  ArrowRight,
  Gavel,
  Plus,
  FileText,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
  Search as SearchIcon,
  Filter,
} from 'lucide-react';
import { db, id, tx } from '../../../../db';
import Link from 'next/link';
import { useState } from 'react';

export default function EventAgendaPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user } = db.useAuth();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Query event and its agenda items
  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      organizer: {},
    },
    agendaItems: {
      creator: {},
      event: {},
      election: {
        candidates: {},
        votes: {},
        position: {
          group: {},
        },
      },
      amendmentVote: {
        changeRequests: {},
        voteEntries: {},
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
  const agendaItems = (data?.agendaItems || [])
    .filter((item: any) => item.event?.id === eventId)
    .sort((a: any, b: any) => a.order - b.order);

  // Calculate start and end times for each agenda item based on event start time
  const agendaItemsWithTimes = agendaItems.map((item: any, index: number) => {
    const eventStartTime = event?.startDate ? new Date(event.startDate).getTime() : Date.now();

    // Calculate cumulative time from previous items
    let cumulativeMinutes = 0;
    for (let i = 0; i < index; i++) {
      cumulativeMinutes += agendaItems[i].duration || 30; // Default 30 min if no duration
    }

    const startTime = new Date(eventStartTime + cumulativeMinutes * 60000);
    const duration = item.duration || 30; // Default 30 minutes
    const endTime = new Date(startTime.getTime() + duration * 60000);

    return {
      ...item,
      calculatedStartTime: startTime,
      calculatedEndTime: endTime,
      calculatedDuration: duration,
    };
  });

  // Apply search and filters
  const filteredAgendaItems = agendaItemsWithTimes.filter((item: any) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    // Status filter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

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
      // Check if user already voted for this election
      const existingVote = userElectionVotes.find((vote: any) => vote.election?.id === electionId);

      if (existingVote) {
        // Check if clicking the same candidate (toggle off)
        if (existingVote.candidate?.id === candidateId) {
          // Delete the vote
          await db.transact([tx.electionVotes[existingVote.id].delete()]);
        } else {
          // Delete old vote and create new one with new candidate
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
        // Create new vote with links
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
      // Check if user already voted for this amendment
      const existingVote = userAmendmentVotes.find(
        (entry: any) => entry.amendmentVote?.id === amendmentVoteId
      );

      if (existingVote) {
        // Update existing vote
        await db.transact([
          tx.amendmentVoteEntries[existingVote.id].update({
            vote: voteValue,
            updatedAt: Date.now(),
          }),
        ]);
      } else {
        // Create new vote with links
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 animate-pulse rounded bg-muted"></div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded bg-muted"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">Event Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The event you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/ dashboard">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAgendaItemIcon = (type: string) => {
    switch (type) {
      case 'election':
        return <UserCheck className="h-4 w-4" />;
      case 'vote':
        return <Vote className="h-4 w-4" />;
      case 'speech':
        return <Users className="h-4 w-4" />;
      case 'discussion':
      default:
        return <FileText className="h-4 w-4" />;
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

  return (
    <AuthGuard>
      <PageWrapper className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Event Header */}
          <div className="space-y-4">
            {/* Agenda Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agenda Statistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Elections Count */}
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <Vote className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {agendaItems.filter((item: any) => item.election).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {agendaItems.filter((item: any) => item.election).length === 1
                          ? 'Wahl'
                          : 'Wahlen'}
                      </p>
                    </div>
                  </div>

                  {/* Amendments Count */}
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                      <Gavel className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {agendaItems.filter((item: any) => item.amendmentVote).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {agendaItems.filter((item: any) => item.amendmentVote).length === 1
                          ? 'Abstimmung'
                          : 'Abstimmungen'}
                      </p>
                    </div>
                  </div>

                  {/* Open Change Requests Count */}
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {agendaItems.reduce(
                          (count: number, item: any) =>
                            count +
                            (item.amendmentVote?.changeRequests?.filter(
                              (cr: any) => cr.status === 'open' || !cr.status
                            ).length || 0),
                          0
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Offene Änderungsanträge</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agenda Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Tagesordnungspunkte ({filteredAgendaItems.length})
              </h2>
            </div>

            {/* Search Bar and Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search agenda items..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine the agenda items</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="type-filter">Type</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger id="type-filter">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="election">Election</SelectItem>
                            <SelectItem value="vote">Vote</SelectItem>
                            <SelectItem value="speech">Speech</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger id="status-filter">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {filteredAgendaItems.length === 0 && searchQuery ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No matching agenda items</h3>
                  <p className="mb-4 text-muted-foreground">Try adjusting your search or filters</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAgendaItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Noch keine Tagesordnungspunkte</h3>
                  <p className="mb-4 text-muted-foreground">
                    Für dieses Event wurden noch keine Tagesordnungspunkte erstellt.
                  </p>
                  <Button asChild>
                    <Link href="/create?type=agenda-item">
                      <Plus className="mr-2 h-4 w-4" />
                      Ersten Tagesordnungspunkt erstellen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredAgendaItems.map((item: any) => {
                  const isPendingPreviousDecision =
                    item.forwardingStatus === 'previous_decision_outstanding';

                  const formatTime = (date: Date) => {
                    return date.toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  };

                  return (
                    <div key={item.id} className="relative flex gap-4">
                      {/* Time Column (outside card, no background) */}
                      <div className="relative flex w-24 flex-shrink-0 flex-col items-center pt-4">
                        {/* Timeline dot */}
                        <div className="h-3 w-3 rounded-full border-2 border-background bg-primary" />

                        {/* Order number */}
                        <div className="mb-2 mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {item.order}
                        </div>

                        {/* Start time */}
                        <div className="mt-2 text-center">
                          <div className="text-sm font-semibold">
                            {formatTime(item.calculatedStartTime)}
                          </div>

                          {/* End time (less prominent) */}
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatTime(item.calculatedEndTime)}
                          </div>

                          {/* Duration badge */}
                          <Badge variant="outline" className="mt-2 text-xs">
                            {item.calculatedDuration}m
                          </Badge>
                        </div>
                      </div>

                      {/* Card with agenda item content */}
                      <Card
                        className={`flex-1 transition-shadow hover:shadow-md ${
                          isPendingPreviousDecision ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getTypeColor(item.type)}>
                                  {getAgendaItemIcon(item.type)}
                                  <span className="ml-1 capitalize">{item.type}</span>
                                </Badge>
                                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                {isPendingPreviousDecision && (
                                  <Badge
                                    variant="outline"
                                    className="border-yellow-600 text-yellow-600"
                                  >
                                    Ausstehende Vorentscheidung
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/event/${eventId}/agenda/${item.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Link>
                            </Button>
                          </div>
                        </CardHeader>

                        {item.description && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground">{item.description}</p>
                          </CardContent>
                        )}

                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Election */}
                            {item.election && (
                              <div>
                                <h4 className="mb-2 font-medium">Wahl</h4>
                                <div className="space-y-2">
                                  {(() => {
                                    const election = item.election;
                                    const userVote = userElectionVotes.find(
                                      (vote: any) => vote.election?.id === election.id
                                    );
                                    const candidates = election.candidates || [];
                                    const voteCounts: Record<string, number> = {};

                                    // Count votes for each candidate from all election votes
                                    (data?.electionVotes || []).forEach((vote: any) => {
                                      if (vote.election?.id === election.id) {
                                        const candId = vote.candidate?.id;
                                        if (candId) {
                                          voteCounts[candId] = (voteCounts[candId] || 0) + 1;
                                        }
                                      }
                                    });

                                    // Get total votes for this election
                                    const totalVotes = (data?.electionVotes || []).filter(
                                      (vote: any) => vote.election?.id === election.id
                                    ).length;

                                    return (
                                      <div className="rounded-lg border bg-card p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold">{election.title}</h5>
                                            {election.description && (
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                {election.description}
                                              </p>
                                            )}
                                            {/* Position Details */}
                                            {election.position && (
                                              <div className="mt-3 rounded-md border bg-muted/30 p-3">
                                                <div className="mb-1 flex items-center gap-2">
                                                  <Badge variant="secondary" className="text-xs">
                                                    Position
                                                  </Badge>
                                                  <span className="font-semibold">
                                                    {election.position.title}
                                                  </span>
                                                </div>
                                                {election.position.description && (
                                                  <p className="text-sm text-muted-foreground">
                                                    {election.position.description}
                                                  </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                  <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                      Amtszeit: {election.position.term}{' '}
                                                      {election.position.term === 1
                                                        ? 'Monat'
                                                        : 'Monate'}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                      Start:{' '}
                                                      {new Date(
                                                        election.position.firstTermStart
                                                      ).toLocaleDateString('de-DE')}
                                                    </span>
                                                  </div>
                                                  {election.position.group && (
                                                    <div className="flex items-center gap-1">
                                                      <Users className="h-3 w-3" />
                                                      <span>{election.position.group.name}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{candidates.length} Kandidaten</span>
                                            <Vote className="h-4 w-4" />
                                            <span>{totalVotes} Stimmen</span>
                                          </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                          <Badge variant="secondary" className="text-xs">
                                            {election.majorityType === 'absolute'
                                              ? 'Absolute Mehrheit'
                                              : 'Relative Mehrheit'}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {election.status || 'Geplant'}
                                          </Badge>
                                        </div>

                                        {/* Candidates and Voting */}
                                        {candidates.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium">Kandidaten:</p>
                                            <div className="grid gap-2">
                                              {candidates
                                                .sort(
                                                  (a: any, b: any) =>
                                                    (a.order || 0) - (b.order || 0)
                                                )
                                                .map((candidate: any) => {
                                                  const voteCount = voteCounts[candidate.id] || 0;
                                                  const isVoted =
                                                    userVote?.candidate?.id === candidate.id;

                                                  return (
                                                    <div
                                                      key={candidate.id}
                                                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                                        isVoted ? 'border-primary bg-primary/5' : ''
                                                      }`}
                                                    >
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                          <span className="font-medium">
                                                            {candidate.name}
                                                          </span>
                                                          {isVoted && (
                                                            <Badge
                                                              variant="default"
                                                              className="text-xs"
                                                            >
                                                              <CheckCircle2 className="mr-1 h-3 w-3" />
                                                              Gewählt
                                                            </Badge>
                                                          )}
                                                        </div>
                                                        {candidate.description && (
                                                          <p className="mt-1 text-sm text-muted-foreground">
                                                            {candidate.description}
                                                          </p>
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-3">
                                                        <Badge variant="outline">
                                                          {voteCount}{' '}
                                                          {voteCount === 1 ? 'Stimme' : 'Stimmen'}
                                                        </Badge>
                                                        <Button
                                                          size="sm"
                                                          variant={isVoted ? 'default' : 'outline'}
                                                          onClick={() =>
                                                            handleElectionVote(
                                                              election.id,
                                                              candidate.id
                                                            )
                                                          }
                                                          disabled={
                                                            votingLoading === election.id || !user
                                                          }
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
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Amendment Vote */}
                            {item.amendmentVote && (
                              <div>
                                <h4 className="mb-2 font-medium">Abstimmung</h4>
                                <div className="space-y-2">
                                  {(() => {
                                    const amendmentVote = item.amendmentVote;
                                    const userVote = userAmendmentVotes.find(
                                      (entry: any) => entry.amendmentVote?.id === amendmentVote.id
                                    );

                                    // Get all vote entries for this amendment vote from the query data
                                    const voteEntries = (data?.amendmentVoteEntries || []).filter(
                                      (entry: any) => entry.amendmentVote?.id === amendmentVote.id
                                    );

                                    // Count votes
                                    const voteCounts = {
                                      yes: voteEntries.filter((e: any) => e.vote === 'yes').length,
                                      no: voteEntries.filter((e: any) => e.vote === 'no').length,
                                      abstain: voteEntries.filter((e: any) => e.vote === 'abstain')
                                        .length,
                                    };
                                    const totalVotes =
                                      voteCounts.yes + voteCounts.no + voteCounts.abstain;

                                    return (
                                      <div className="rounded-lg border bg-card p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold">{amendmentVote.title}</h5>
                                            {amendmentVote.description && (
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                {amendmentVote.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Vote className="h-4 w-4" />
                                            <span>{totalVotes} Stimmen</span>
                                            <FileText className="h-4 w-4" />
                                            <span>
                                              {amendmentVote.changeRequests?.length || 0}{' '}
                                              Änderungsanträge
                                            </span>
                                          </div>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {amendmentVote.status || 'Geplant'}
                                          </Badge>
                                        </div>

                                        {/* Vote Results */}
                                        {totalVotes > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium">Ergebnisse:</p>
                                            <div className="grid grid-cols-3 gap-2">
                                              <div className="rounded-lg bg-green-50 p-2 text-center dark:bg-green-950">
                                                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                                  {voteCounts.yes}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400">
                                                  Ja
                                                </div>
                                              </div>
                                              <div className="rounded-lg bg-red-50 p-2 text-center dark:bg-red-950">
                                                <div className="text-lg font-bold text-red-700 dark:text-red-300">
                                                  {voteCounts.no}
                                                </div>
                                                <div className="text-xs text-red-600 dark:text-red-400">
                                                  Nein
                                                </div>
                                              </div>
                                              <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-900">
                                                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                                  {voteCounts.abstain}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                  Enthalten
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Voting Buttons */}
                                        <div className="mt-4 space-y-2">
                                          <p className="text-sm font-medium">Ihre Stimme:</p>
                                          <div className="grid grid-cols-3 gap-2">
                                            <Button
                                              variant={
                                                userVote?.vote === 'yes' ? 'default' : 'outline'
                                              }
                                              size="sm"
                                              onClick={() =>
                                                handleAmendmentVote(amendmentVote.id, 'yes')
                                              }
                                              disabled={votingLoading === amendmentVote.id || !user}
                                              className={
                                                userVote?.vote === 'yes'
                                                  ? 'bg-green-600 hover:bg-green-700'
                                                  : ''
                                              }
                                            >
                                              <ThumbsUp className="mr-2 h-4 w-4" />
                                              Ja
                                            </Button>
                                            <Button
                                              variant={
                                                userVote?.vote === 'no' ? 'default' : 'outline'
                                              }
                                              size="sm"
                                              onClick={() =>
                                                handleAmendmentVote(amendmentVote.id, 'no')
                                              }
                                              disabled={votingLoading === amendmentVote.id || !user}
                                              className={
                                                userVote?.vote === 'no'
                                                  ? 'bg-red-600 hover:bg-red-700'
                                                  : ''
                                              }
                                            >
                                              <ThumbsDown className="mr-2 h-4 w-4" />
                                              Nein
                                            </Button>
                                            <Button
                                              variant={
                                                userVote?.vote === 'abstain' ? 'default' : 'outline'
                                              }
                                              size="sm"
                                              onClick={() =>
                                                handleAmendmentVote(amendmentVote.id, 'abstain')
                                              }
                                              disabled={votingLoading === amendmentVote.id || !user}
                                              className={
                                                userVote?.vote === 'abstain'
                                                  ? 'bg-gray-600 hover:bg-gray-700'
                                                  : ''
                                              }
                                            >
                                              <Minus className="mr-2 h-4 w-4" />
                                              Enthalten
                                            </Button>
                                          </div>
                                          {userVote && (
                                            <p className="text-xs text-muted-foreground">
                                              Sie haben mit{' '}
                                              <span className="font-medium">
                                                {userVote.vote === 'yes'
                                                  ? 'Ja'
                                                  : userVote.vote === 'no'
                                                    ? 'Nein'
                                                    : 'Enthalten'}
                                              </span>{' '}
                                              gestimmt
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  Von {item.creator?.name || item.creator?.email || 'Unbekannt'}
                                </span>
                              </div>
                              {item.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    Geplant: {new Date(item.scheduledTime).toLocaleString('de-DE')}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {item.election && (
                                <Badge variant="outline">
                                  <Vote className="mr-1 h-3 w-3" />1 Wahl
                                </Badge>
                              )}
                              {item.amendmentVote && (
                                <Badge variant="outline">
                                  <Gavel className="mr-1 h-3 w-3" />1 Abstimmung
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>Verwalte die Tagesordnung dieses Events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/create?type=agenda-item">
                    <Plus className="mr-2 h-4 w-4" />
                    Tagesordnungspunkt hinzufügen
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/create?type=election">
                    <Vote className="mr-2 h-4 w-4" />
                    Wahl erstellen
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/create?type=amendment-vote">
                    <Gavel className="mr-2 h-4 w-4" />
                    Abstimmung erstellen
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={`/event/${eventId}`}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Zurück zum Event
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
