'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/features/shared/ui/ui/carousel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/features/shared/ui/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Mic, Plus, Users, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';

interface Speaker {
  id: string;
  order: number;
  time: number;
  completed: boolean;
  title?: string;
  startTime?: number;
  endTime?: number;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

interface AgendaSpeakerListSectionProps {
  speakers: Speaker[];
  isUserInSpeakerList: boolean;
  canManageSpeakers: boolean;
  isAddingSpeaker: boolean;
  isRemovingSpeaker?: boolean;
  userId?: string;
  agendaStartTime?: number;
  onAddToSpeakerList: () => void;
  onRemoveFromSpeakerList?: () => void;
  onMarkCompleted?: (speakerId: string) => void;
  className?: string;
}

function formatClockTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function AgendaSpeakerListSection({
  speakers,
  isUserInSpeakerList,
  canManageSpeakers,
  isAddingSpeaker,
  isRemovingSpeaker,
  userId,
  agendaStartTime,
  onAddToSpeakerList,
  onRemoveFromSpeakerList,
  onMarkCompleted,
  className,
}: AgendaSpeakerListSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [now, setNow] = useState(() => Date.now());

  const sortedSpeakers = [...speakers].sort((a, b) => a.order - b.order);
  const currentSpeakerIndex = sortedSpeakers.findIndex(speaker => !speaker.completed);
  const currentSpeaker = currentSpeakerIndex >= 0 ? sortedSpeakers[currentSpeakerIndex] : null;
  const queueStartTime =
    agendaStartTime ?? currentSpeaker?.startTime ?? sortedSpeakers[0]?.startTime ?? Date.now();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const speakerQueue = useMemo(() => {
    let accumulatedMinutes = 0;

    return sortedSpeakers.map((speaker, index) => {
      const estimatedStartTime = queueStartTime + accumulatedMinutes * 60 * 1000;
      const durationMinutes = speaker.time ?? 3;
      const estimatedEndTime = estimatedStartTime + durationMinutes * 60 * 1000;
      accumulatedMinutes += durationMinutes;

      const isCurrent = index === currentSpeakerIndex;
      const isPast = speaker.completed;
      const isCurrentUser = speaker.user?.id === userId && !speaker.completed;
      const activeStartTime = speaker.startTime ?? estimatedStartTime;
      const activeEndTime = activeStartTime + durationMinutes * 60 * 1000;
      const msUntilStart = estimatedStartTime - now;
      const msUntilEnd = activeEndTime - now;

      return {
        ...speaker,
        estimatedStartTime,
        estimatedEndTime,
        durationMinutes,
        isCurrent,
        isPast,
        isCurrentUser,
        msUntilStart,
        msUntilEnd,
      };
    });
  }, [sortedSpeakers, queueStartTime, currentSpeakerIndex, userId, now]);

  const userSpeaker = speakerQueue.find(speaker => speaker.isCurrentUser && !speaker.completed);
  const showMembershipState = isUserInSpeakerList || Boolean(userSpeaker);

  useEffect(() => {
    if (!carouselApi || !expanded) return;
    const targetIndex = currentSpeakerIndex >= 0 ? currentSpeakerIndex : 0;
    carouselApi.scrollTo(targetIndex, true);
  }, [carouselApi, currentSpeakerIndex, expanded, speakerQueue.length]);

  const renderRelativeTime = (speaker: (typeof speakerQueue)[number]) => {
    if (speaker.completed) {
      return t('features.events.agenda.completedSpeaker', 'Completed');
    }

    if (speaker.isCurrent) {
      return formatDuration(speaker.msUntilEnd);
    }

    if (speaker.msUntilStart <= 0) {
      return t('features.events.agenda.upNext', 'Up next');
    }

    return formatDuration(speaker.msUntilStart);
  };

  const renderTimingLabel = (speaker: (typeof speakerQueue)[number]) => {
    if (speaker.completed) {
      return t('features.events.agenda.turnCompletedLabel', 'Turn completed');
    }

    if (speaker.isCurrent) {
      return t('features.events.agenda.timeRemainingLabel', 'Time remaining');
    }

    return t('features.events.agenda.turnStartsIn', 'Turn starts in');
  };

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mic className="h-5 w-5" />
                  {t('features.events.agenda.speakerList')} ({speakers.length})
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
              </Button>
            </CollapsibleTrigger>
            <Badge variant="outline">{t('features.events.agenda.speakerCount', { count: speakers.length }, '{{count}} speakers')}</Badge>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {speakerQueue.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('features.events.agenda.speakerListEmpty')}
                </p>
              </div>
            ) : (
              <div className="px-10">
                <Carousel setApi={setCarouselApi} className="w-full" opts={{ align: 'start', dragFree: true }}>
                  <CarouselContent className="-ml-3 md:-ml-4">
                    {speakerQueue.map((speaker) => {
                      const speakerName = speaker.user?.name || speaker.user?.email || t('common.unspecified');
                      return (
                        <CarouselItem
                          key={speaker.id}
                          className="basis-[86%] pl-3 sm:basis-[55%] md:basis-[44%] md:pl-4 lg:basis-[32%]"
                        >
                          <Card
                            className={cn(
                              'h-full border transition-colors',
                              speaker.isPast && 'opacity-60',
                              speaker.isCurrent && 'border-primary bg-primary/5',
                              speaker.isCurrentUser && 'ring-2 ring-primary/25',
                            )}
                          >
                            <CardContent className="flex h-full flex-col gap-4 p-5">
                              <div className="flex items-start justify-between gap-3">
                                <Link
                                  to="/user/$id"
                                  params={{ id: speaker.user?.id ?? '' }}
                                  className="flex min-w-0 items-center gap-3"
                                >
                                  <Avatar className="h-14 w-14 border border-border/60">
                                    <AvatarImage src={speaker.user?.avatar} />
                                    <AvatarFallback>
                                      {speakerName[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="truncate font-medium hover:underline">{speakerName}</p>
                                      {speaker.isCurrent && (
                                        <Badge variant="default">
                                          {t('features.events.agenda.currentSpeaker')}
                                        </Badge>
                                      )}
                                      {speaker.isCurrentUser && (
                                        <Badge variant="secondary">
                                          {t('features.events.agenda.alreadyOnList')}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {t('features.events.agenda.speakerPosition', { count: speaker.order }, 'Position {{count}}')}
                                    </p>
                                  </div>
                                </Link>

                                {canManageSpeakers && speaker.isCurrent && onMarkCompleted && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => onMarkCompleted(speaker.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="mt-auto space-y-3">
                                <div className="rounded-lg bg-muted/60 p-3">
                                  <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">
                                      {renderTimingLabel(speaker)}
                                    </span>
                                    <span className="font-medium">{renderRelativeTime(speaker)}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">
                                      {t('features.events.agenda.estimatedStartLabel', 'Estimated at')}
                                    </span>
                                    <span className="font-medium">{formatClockTime(speaker.estimatedStartTime)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {speaker.time} {t('common.minutes')}
                                  </span>
                                  {speaker.completed && (
                                    <Badge variant="outline">
                                      {t('features.events.agenda.completedSpeaker', 'Completed')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="left-1 h-9 w-9" />
                  <CarouselNext className="right-1 h-9 w-9" />
                </Carousel>
              </div>
            )}

            {showMembershipState ? (
              <div className="rounded-lg border bg-primary/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{t('features.events.agenda.alreadyOnList')}</p>
                    {userSpeaker ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {userSpeaker.isCurrent
                            ? t(
                                'features.events.agenda.userSpeakerCurrentSummary',
                                { time: renderRelativeTime(userSpeaker) },
                                'You are speaking now. {{time}} remaining.'
                              )
                            : t(
                                'features.events.agenda.userSpeakerQueueSummary',
                                {
                                  position: userSpeaker.order,
                                  time: renderRelativeTime(userSpeaker),
                                },
                                'Position {{position}}. {{time}} until your speech starts.'
                              )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('features.events.agenda.estimatedStartLabel', 'Estimated at')} {formatClockTime(userSpeaker.estimatedStartTime)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t('features.events.agenda.userSpeakerPendingSummary', 'Your speaker entry is active.')}
                      </p>
                    )}
                  </div>

                  {onRemoveFromSpeakerList && (
                    <Button
                      onClick={onRemoveFromSpeakerList}
                      disabled={isRemovingSpeaker}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {isRemovingSpeaker
                        ? t('common.loading.default')
                        : t('features.events.agenda.leaveSpeakerList', 'Leave Speaker List')}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                onClick={onAddToSpeakerList}
                disabled={!userId || isAddingSpeaker}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isAddingSpeaker
                  ? t('common.loading.default')
                  : t('features.events.agenda.joinSpeakerList')}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
