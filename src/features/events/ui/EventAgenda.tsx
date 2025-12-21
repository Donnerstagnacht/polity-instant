'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../db/db';
import { useEventData } from '../hooks/useEventData';
import { useAgendaItems } from '../hooks/useAgendaItems';
import { useVoting } from '../hooks/useVoting';
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

interface EventAgendaProps {
  eventId: string;
}

export function EventAgenda({ eventId }: EventAgendaProps) {
  const router = useRouter();
  const { user } = db.useAuth();
  const { event, isLoading: eventLoading } = useEventData(eventId);
  const { agendaItems, electionVotes, amendmentVoteEntries, isLoading } = useAgendaItems(eventId);
  const { handleElectionVote, handleAmendmentVote, votingLoading } = useVoting();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate start and end times for each agenda item
  const agendaItemsWithTimes = agendaItems.map((item: any, index: number) => {
    const eventStartTime = event?.startDate ? new Date(event.startDate).getTime() : Date.now();

    let cumulativeMinutes = 0;
    for (let i = 0; i < index; i++) {
      cumulativeMinutes += agendaItems[i].duration || 30;
    }

    const startTime = new Date(eventStartTime + cumulativeMinutes * 60000);
    const duration = item.duration || 30;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    return {
      ...item,
      calculatedStartTime: startTime,
      calculatedEndTime: endTime,
      calculatedDuration: duration,
    };
  });

  // Apply filters
  const filteredAgendaItems = agendaItemsWithTimes.filter((item: any) => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get user votes
  const userElectionVotes = electionVotes.filter((vote: any) => vote.voter?.id === user?.id);
  const userAmendmentVotes = amendmentVoteEntries.filter(
    (entry: any) => entry.voter?.id === user?.id
  );

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || eventLoading) {
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
              <Link href="/calendar">Return to Calendar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agenda Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agenda Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Vote className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agendaItems.filter((item: any) => item.election).length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {agendaItems.filter((item: any) => item.election).length === 1 ? 'Wahl' : 'Wahlen'}
                </p>
              </div>
            </div>

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

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Tagesordnungspunkte ({filteredAgendaItems.length})
          </h2>
        </div>

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

      {/* Agenda Items List */}
      {filteredAgendaItems.length === 0 ? (
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
            const userElectionVote = userElectionVotes.find(
              (vote: any) => vote.election?.id === item.election?.id
            );
            const userAmendmentVote = userAmendmentVotes.find(
              (entry: any) => entry.amendmentVote?.id === item.amendmentVote?.id
            );

            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Time Column */}
                <div className="relative flex w-24 flex-shrink-0 flex-col items-center pt-4">
                  <div className="h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <div className="mb-2 mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {item.order}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-semibold">
                      {formatTime(item.calculatedStartTime)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatTime(item.calculatedEndTime)}
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {item.calculatedDuration}m
                    </Badge>
                  </div>
                </div>

                {/* Card with content */}
                <Card className="flex-1 transition-shadow hover:shadow-md">
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

                  <CardFooter className="pt-3">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Von {item.creator?.name || item.creator?.email || 'Unbekannt'}</span>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}

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
  );
}
