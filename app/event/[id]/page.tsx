'use client';

import { useState, useRef } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { SubscriberStatsBar } from '@/components/ui/SubscriberStatsBar';
import { EventSubscribeButton } from '@/features/events/ui/EventSubscribeButton';
import { useSubscribeEvent } from '@/features/events/hooks/useSubscribeEvent';
import { useEventParticipation } from '@/features/events/hooks/useEventParticipation';
import { EventParticipationButton } from '@/features/events/ui/EventParticipationButton';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

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
      participants: {
        user: {
          profile: {},
        },
      },
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

  // Count active participants (members and admins only)
  const activeParticipants =
    event?.participants?.filter((p: any) => p.status === 'member' || p.status === 'admin') || [];
  const activeParticipantCount = activeParticipants.length;

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!event) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-lg text-muted-foreground">Event not found</p>
            <Button onClick={() => router.push('/calendar')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calendar
            </Button>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <div className="container mx-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <EventSubscribeButton
                eventId={eventId}
                onSubscribeChange={async isNowSubscribed => {
                  setAnimationText(isNowSubscribed ? '+1' : '-1');
                  setShowAnimation(true);
                  setTimeout(() => setShowAnimation(false), 1000);
                }}
              />
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
            </div>
          </div>

          {/* Subscriber Stats Bar */}
          <div className="mb-4">
            <SubscriberStatsBar
              participantCount={participantCount}
              subscriberCount={subscriberCount}
              showAnimation={showAnimation}
              animationText={animationText}
              animationRef={animationRef}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                {event.imageURL && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={event.imageURL}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {event.isPublic ? (
                      <Badge variant="default">Public Event</Badge>
                    ) : (
                      <Badge variant="secondary">Private Event</Badge>
                    )}
                    {event.tags &&
                      Array.isArray(event.tags) &&
                      event.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                  <CardTitle className="text-3xl">{event.title}</CardTitle>

                  {/* Organizer Info */}
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={event.organizer?.profile?.avatar} />
                      <AvatarFallback>
                        {event.organizer?.profile?.name?.[0]?.toUpperCase() || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Organized by {event.organizer?.profile?.name || 'Unknown'}
                      </p>
                      {event.group && (
                        <p className="text-xs text-muted-foreground">Part of {event.group.name}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="space-y-4">
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
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{activeParticipantCount} Participants</p>
                        {event.capacity && (
                          <p className="text-sm text-muted-foreground">
                            Capacity: {activeParticipantCount}/{event.capacity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Hashtags */}
                  {event.hashtags && event.hashtags.length > 0 && (
                    <>
                      <HashtagDisplay hashtags={event.hashtags} title="Event Tags" />
                      <Separator />
                    </>
                  )}

                  {/* Description */}
                  {event.description && (
                    <div>
                      <h3 className="mb-2 font-semibold">About this event</h3>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Active Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participants ({activeParticipantCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-3">
                      {activeParticipants.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No participants yet</p>
                      ) : (
                        activeParticipants.map((participant: any) => (
                          <div
                            key={participant.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                            onClick={() => router.push(`/user/${participant.user?.id}`)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.user?.profile?.avatar} />
                              <AvatarFallback>
                                {participant.user?.profile?.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-medium">
                                {participant.user?.profile?.name || 'Unknown User'}
                              </p>
                              {participant.status === 'admin' && (
                                <Badge variant="default" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
