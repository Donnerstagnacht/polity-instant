'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../db';
import { Calendar, MapPin, Settings } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { StatsBar } from '@/components/ui/StatsBar';
import { EventSubscribeButton } from '@/features/events/ui/EventSubscribeButton';
import { useSubscribeEvent } from '@/features/events/hooks/useSubscribeEvent';
import { useEventParticipation } from '@/features/events/hooks/useEventParticipation';
import { EventParticipationButton } from '@/features/events/ui/EventParticipationButton';
import { ActionBar } from '@/components/ui/ActionBar';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';

interface EventWikiProps {
  eventId: string;
}

export function EventWiki({ eventId }: EventWikiProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Subscribe hook
  const { subscriberCount } = useSubscribeEvent(eventId);

  // Participation hook
  const {
    status,
    isParticipant,
    hasRequested,
    isInvited,
    participantCount,
    isLoading: participationLoading,
    requestParticipation,
    leaveEvent,
    acceptInvitation,
  } = useEventParticipation(eventId);

  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      organizer: {
        profile: {},
      },
      group: {},
      hashtags: {},
    },
  });

  const event = data?.events?.[0];

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = status === 'admin';

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{event.title}</h1>
          {event.isPublic ? (
            <Badge variant="default">{t('components.badges.public')}</Badge>
          ) : (
            <Badge variant="secondary">{t('components.badges.private')}</Badge>
          )}
        </div>

        {/* Organizer Info */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={event.organizer?.profile?.avatar} />
            <AvatarFallback>
              {event.organizer?.profile?.name?.[0]?.toUpperCase() || 'O'}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">
              {t('components.labels.organizedBy')} {event.organizer?.profile?.name || 'Unknown'}
            </p>
            {event.group && (
              <p className="text-xs text-muted-foreground">
                {t('components.labels.partOf')} {event.group.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Image */}
      {event.imageURL && (
        <div className="mb-8">
          <img
            src={event.imageURL}
            alt={event.title}
            className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
          />
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar
        stats={[
          { value: participantCount, labelKey: 'components.labels.participants' },
          { value: subscriberCount, labelKey: 'components.labels.subscribers' },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <EventSubscribeButton eventId={eventId} />
        <EventParticipationButton
          status={status}
          isParticipant={isParticipant}
          hasRequested={hasRequested}
          isInvited={isInvited}
          onRequestParticipation={requestParticipation}
          onLeave={leaveEvent}
          onAcceptInvitation={acceptInvitation}
          isLoading={participationLoading}
        />
        <ShareButton
          url={`/event/${eventId}`}
          title={event.title}
          description={event.description || ''}
        />
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/event/${eventId}/edit`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {event.hashtags && event.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={event.hashtags} centered />
        </div>
      )}

      {/* Event Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('components.labels.eventDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time and Location side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDate(event.startDate)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(event.startDate)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t('components.labels.location')}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Tab */}
      {event.description && (
        <InfoTabs
          about={event.description}
          contact={{
            location: event.location,
          }}
          className="mb-12"
        />
      )}
    </div>
  );
}
