'use client';

import { useState, useRef } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useParams, useRouter } from 'next/navigation';
import { db, tx, id } from '../../../db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, MapPin, Users, ArrowLeft, Check, X, HelpCircle } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { SubscriberStatsBar } from '@/components/ui/SubscriberStatsBar';
import { EventSubscribeButton } from '@/features/events/ui/EventSubscribeButton';
import { useSubscribeEvent } from '@/features/events/hooks/useSubscribeEvent';

type EventStatus = 'going' | 'maybe' | 'declined' | 'invited';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user } = db.useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

  // Subscribe hook
  const { subscriberCount } = useSubscribeEvent(eventId);

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

  const handleStatusChange = async (status: EventStatus) => {
    if (!user?.id || !eventId) return;

    // Check if user already has a participation record
    const existingParticipation = event?.participants?.find((p: any) => p.user?.id === user.id);

    if (existingParticipation) {
      // Update existing participation
      await db.transact([
        tx.eventParticipants[existingParticipation.id].update({
          status,
        }),
      ]);
    } else {
      // Create new participation
      const participantId = id();
      await db.transact([
        tx.eventParticipants[participantId].update({
          status,
          joinedAt: new Date(),
          role: 'attendee',
        }),
        tx.eventParticipants[participantId].link({
          event: eventId,
          user: user.id,
        }),
      ]);
    }
  };

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

  const getParticipantsByStatus = (status: EventStatus) => {
    return event?.participants?.filter((p: any) => p.status === status) || [];
  };

  const userParticipation = event?.participants?.find((p: any) => p.user?.id === user?.id);
  const userStatus = userParticipation?.status as EventStatus | undefined;

  const goingCount = getParticipantsByStatus('going').length;
  const maybeCount = getParticipantsByStatus('maybe').length;

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
            <EventSubscribeButton
              eventId={eventId}
              onSubscribeChange={async isNowSubscribed => {
                setAnimationText(isNowSubscribed ? '+1' : '-1');
                setShowAnimation(true);
                setTimeout(() => setShowAnimation(false), 1000);
              }}
            />
          </div>

          {/* Subscriber Stats Bar */}
          <div className="mb-4">
            <SubscriberStatsBar
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
                        <p className="font-medium">
                          {goingCount} Going · {maybeCount} Interested
                        </p>
                        {event.capacity && (
                          <p className="text-sm text-muted-foreground">
                            Capacity: {goingCount}/{event.capacity}
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

                  {/* RSVP Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={userStatus === 'going' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('going')}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Going
                    </Button>
                    <Button
                      variant={userStatus === 'maybe' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('maybe')}
                      className="flex-1"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Maybe
                    </Button>
                    <Button
                      variant={userStatus === 'declined' ? 'destructive' : 'outline'}
                      onClick={() => handleStatusChange('declined')}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Can't Go
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Going */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Going ({goingCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-3">
                      {getParticipantsByStatus('going').length === 0 ? (
                        <p className="text-sm text-muted-foreground">No one yet</p>
                      ) : (
                        getParticipantsByStatus('going').map((participant: any) => (
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
                              {participant.role && participant.role !== 'attendee' && (
                                <Badge variant="outline" className="text-xs">
                                  {participant.role}
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

              {/* Maybe */}
              {maybeCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Maybe ({maybeCount})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-3">
                        {getParticipantsByStatus('maybe').map((participant: any) => (
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
                            <p className="truncate text-sm font-medium">
                              {participant.user?.profile?.name || 'Unknown User'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
