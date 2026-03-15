'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useEventData } from '@/features/events/hooks/useEventData';
import { useAgendaItems } from '../hooks/useAgendaItems';
import { usePermissions } from '@/zero/rbac';
import { TransferAgendaItemDialog } from './TransferAgendaItemDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select';
import {
  Calendar,
  Vote,
  Gavel,
  Plus,
  FileText,
  Search as SearchIcon,
  Filter,
  Play,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { ActionBar } from '@/features/shared/ui/ui/ActionBar';
import { TimelineItem } from '@/features/agendas/ui/TimelineItem.tsx';
import {
  AgendaCard,
  type AgendaItemType,
  type AgendaItemStatus,
} from '@/features/agendas/ui/AgendaCard.tsx';
import { AgendaNavigationControls } from './AgendaNavigationControls';

interface EventAgendaProps {
  eventId: string;
}

export function EventAgenda({ eventId }: EventAgendaProps) {
  const { t } = useTranslation();
  const { event, isLoading: eventLoading } = useEventData(eventId);
  const { agendaItems, isLoading } = useAgendaItems(eventId);
  const { can } = usePermissions({ eventId });

  // Track current agenda item changes for toast notifications
  const previousAgendaItemIdRef = useRef<string | null>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const currentAgendaItemId = event?.current_agenda_item_id ?? undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [transferDialogItem, setTransferDialogItem] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Show toast and auto-scroll when current agenda item changes
  useEffect(() => {
    if (currentAgendaItemId && currentAgendaItemId !== previousAgendaItemIdRef.current) {
      const currentItem = agendaItems.find(item => item.id === currentAgendaItemId);
      if (currentItem && previousAgendaItemIdRef.current !== null) {
        // Only show toast if this is not the initial load
        toast(t('features.events.agenda.itemActivated'), {
          description: currentItem.title,
        });
      }
      previousAgendaItemIdRef.current = currentAgendaItemId;

      // Auto-scroll to active item after a short delay
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentAgendaItemId, agendaItems, toast, t]);

  // Check if user can manage agenda items
  const canManageAgenda = can('manage', 'agendaItems');

  // Calculate start and end times for each agenda item
  const agendaItemsWithTimes = agendaItems.map((item, index: number) => {
    const eventStartTime = event?.start_date ? new Date(event.start_date).getTime() : Date.now();

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
  const filteredAgendaItems = agendaItemsWithTimes.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || eventLoading) {
    return (
      <div>
        <div className="space-y-6">
          <div className="bg-muted h-8 animate-pulse rounded"></div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted h-32 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t('features.events.wiki.notFound')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('features.events.wiki.notFoundDescription')}
            </p>
            <Button asChild>
              <Link to="/calendar">{t('features.events.backToCalendar')}</Link>
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
          <CardTitle className="text-lg">{t('features.events.agenda.statistics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 md:h-10 md:w-10 dark:bg-purple-900">
                <Vote className="h-4 w-4 text-purple-600 md:h-5 md:w-5 dark:text-purple-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold md:text-2xl">
                  {agendaItems.filter(item => item.election).length}
                </p>
                <p className="text-muted-foreground truncate text-xs md:text-sm">
                  {agendaItems.filter(item => item.election).length === 1
                    ? t('features.events.agenda.election')
                    : t('features.events.agenda.elections')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 md:h-10 md:w-10 dark:bg-orange-900">
                <Gavel className="h-4 w-4 text-orange-600 md:h-5 md:w-5 dark:text-orange-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold md:text-2xl">
                  {agendaItems.filter(item => item.amendment).length}
                </p>
                <p className="text-muted-foreground truncate text-xs md:text-sm">
                  {agendaItems.filter(item => item.amendment).length === 1
                    ? t('features.events.agenda.amendment')
                    : t('features.events.agenda.amendments')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 md:h-10 md:w-10 dark:bg-blue-900">
                <FileText className="h-4 w-4 text-blue-600 md:h-5 md:w-5 dark:text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold md:text-2xl">
                  {agendaItems.reduce(
                    (count: number, item) =>
                      count +
                      (item.amendment?.change_requests?.filter(
                        cr => cr.status === 'open' || !cr.status
                      ).length || 0),
                    0
                  )}
                </p>
                <p className="text-muted-foreground truncate text-xs md:text-sm">
                  {t('features.events.agenda.openChangeRequests')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda Navigation Controls for managing agenda progression */}
      {canManageAgenda && <AgendaNavigationControls eventId={eventId} />}

      {/* Action Bar */}
      <ActionBar>
        <Button asChild variant="outline">
          <Link to="/create/agenda-item" search={{ eventId }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('features.events.agenda.quickActions.addItem')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/create/agenda-item" search={{ eventId, type: 'election' }}>
            <Vote className="mr-2 h-4 w-4" />
            {t('features.events.agenda.quickActions.createElection')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/create/agenda-item" search={{ eventId, type: 'vote' }}>
            <Gavel className="mr-2 h-4 w-4" />
            {t('features.events.agenda.quickActions.createVote')}
          </Link>
        </Button>
      </ActionBar>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t('features.events.agenda.itemsCount', { count: filteredAgendaItems.length })}
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('features.events.agenda.searchPlaceholder')}
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
              <CardTitle>{t('features.events.agenda.filters')}</CardTitle>
              <CardDescription>{t('features.events.agenda.filtersDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">{t('features.events.agenda.type')}</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('features.events.agenda.allTypes')}</SelectItem>
                      <SelectItem value="election">
                        {t('features.events.agenda.typeElection')}
                      </SelectItem>
                      <SelectItem value="vote">{t('features.events.agenda.typeVote')}</SelectItem>
                      <SelectItem value="speech">
                        {t('features.events.agenda.typeSpeech')}
                      </SelectItem>
                      <SelectItem value="discussion">
                        {t('features.events.agenda.typeDiscussion')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">{t('features.events.agenda.statusLabel')}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('features.events.agenda.allStatus')}</SelectItem>
                      <SelectItem value="pending">
                        {t('features.events.agenda.statusPending')}
                      </SelectItem>
                      <SelectItem value="in-progress">
                        {t('features.events.agenda.statusInProgress')}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t('features.events.agenda.statusCompleted')}
                      </SelectItem>
                      <SelectItem value="planned">
                        {t('features.events.agenda.statusPlanned')}
                      </SelectItem>
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
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">{t('features.events.agenda.noItems')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('features.events.agenda.noItemsDescription')}
            </p>
            <Button asChild>
              <Link to="/create/agenda-item" search={{ eventId }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('features.events.agenda.createFirstItem')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAgendaItems.map(item => {
            const isActive = item.status === 'in-progress';

            // Determine if we need an action button
            let actionButton = null;
            if (isActive) {
              if (item.election) {
                actionButton = (
                  <Button size="sm" variant="default">
                    <Vote className="mr-2 h-4 w-4" />
                    {t('features.events.agenda.vote')}
                  </Button>
                );
              } else if (item.amendment) {
                actionButton = (
                  <Button size="sm" variant="default">
                    <Gavel className="mr-2 h-4 w-4" />
                    {t('features.events.agenda.vote')}
                  </Button>
                );
              }
            }

            // Check if this is the currently active item from event
            const isCurrentItem = currentAgendaItemId === item.id;
            const isCompleted = item.status === 'completed' || !!item.completed_at;

            return (
              <div
                key={item.id}
                ref={isCurrentItem ? activeItemRef : undefined}
                className={isCurrentItem ? 'relative' : ''}
              >
                {/* Active item indicator */}
                {isCurrentItem && (
                  <div className="absolute top-1/2 -left-4 flex -translate-y-1/2 items-center gap-2">
                    <div className="animate-pulse">
                      <Play className="fill-primary text-primary h-5 w-5" />
                    </div>
                  </div>
                )}
                <TimelineItem
                  order={item.order_index ?? 0}
                  startTime={formatTime(item.calculatedStartTime)}
                  endTime={formatTime(item.calculatedEndTime)}
                  duration={item.calculatedDuration}
                >
                  <div
                    className={`relative ${isCurrentItem ? 'animate-pulse-subtle ring-primary rounded-lg ring-2 ring-offset-2' : ''} ${isCompleted ? 'opacity-70' : ''}`}
                  >
                    {/* Completion checkmark overlay */}
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    <AgendaCard
                      id={item.id}
                      title={item.title ?? ''}
                      description={item.description ?? undefined}
                      type={(item.type ?? 'discussion') as AgendaItemType}
                      status={(item.status ?? 'pending') as AgendaItemStatus}
                      creatorName={
                        [item.creator?.first_name, item.creator?.last_name]
                          .filter(Boolean)
                          .join(' ') ||
                        (item.creator?.email ?? undefined)
                      }
                      detailsLink={`/event/${eventId}/agenda/${item.id}`}
                      isActive={isActive}
                      actionButton={actionButton}
                      showMoveButton={canManageAgenda}
                      onMoveClick={() =>
                        setTransferDialogItem({ id: item.id, title: item.title ?? '' })
                      }
                    />
                  </div>
                </TimelineItem>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Dialog */}
      {transferDialogItem && (
        <TransferAgendaItemDialog
          agendaItemId={transferDialogItem.id}
          agendaItemTitle={transferDialogItem.title}
          currentEventId={eventId}
          currentEventTitle={event?.title || 'Event'}
          open={!!transferDialogItem}
          onOpenChange={isOpen => {
            if (!isOpen) setTransferDialogItem(null);
          }}
          onTransferComplete={() => {
            setTransferDialogItem(null);
            // Zero's reactive queries auto-refresh when data changes
          }}
        />
      )}
    </div>
  );
}
