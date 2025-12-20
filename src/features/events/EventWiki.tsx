'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db, { id, tx } from '../../../db';
import { Settings, Trophy, UserCheck, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { toast } from 'sonner';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { StatsBar } from '@/components/ui/StatsBar';
import { useSubscribeEvent } from '@/features/events/hooks/useSubscribeEvent';
import { useEventParticipation } from '@/features/events/hooks/useEventParticipation';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';
import { DelegatesOverview } from './components/DelegatesOverview';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface EventWikiProps {
  eventId: string;
}

export function EventWiki({ eventId }: EventWikiProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [electionsDialogOpen, setElectionsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeEvent(eventId);

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
      organizer: {},
      group: {},
      hashtags: {},
      eventPositions: {
        holders: {
          user: {},
        },
        election: {},
      },
      participants: {
        user: {},
      },
    },
    agendaItems: {
      event: {},
      election: {
        candidates: {
          user: {},
        },
        position: {},
      },
      amendmentVote: {
        changeRequests: {},
      },
    },
    $users: {},
  });

  const { user } = db.useAuth();

  // Get current user's profile
  const currentUserProfile = user ? (data?.$users || []).find((u: any) => u.id === user.id) : null;

  const event = data?.events?.[0];

  // Calculate agenda statistics
  const agendaItems = (data?.agendaItems || []).filter((item: any) => item.event?.id === eventId);
  const electionsCount = agendaItems.filter((item: any) => item.election).length;
  const amendmentsCount = agendaItems.filter((item: any) => item.amendmentVote).length;
  const openChangeRequestsCount = agendaItems.reduce(
    (count: number, item: any) =>
      count +
      (item.amendmentVote?.changeRequests?.filter((cr: any) => cr.status === 'open' || !cr.status)
        .length || 0),
    0
  );

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

  // Get elections for this event
  const elections = (agendaItems || [])
    .filter((item: any) => item.election)
    .map((item: any) => item.election);

  // Check if user is already a candidate in any election
  const getUserCandidacy = (election: any) => {
    return election.candidates?.find((c: any) => c.user?.id === user?.id);
  };

  // Handle election selection
  const handleElectionClick = (election: any) => {
    setSelectedElection(election);
    setElectionsDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  // Handle candidate submission
  const handleConfirmCandidacy = async () => {
    if (!user || !selectedElection) return;

    setIsSubmitting(true);
    try {
      // Check if user is already a candidate
      const existingCandidacy = getUserCandidacy(selectedElection);
      if (existingCandidacy) {
        toast.error('Sie sind bereits Kandidat für diese Wahl');
        setConfirmDialogOpen(false);
        setIsSubmitting(false);
        return;
      }

      const candidateId = id();
      const now = Date.now();

      // Get the next order number
      const maxOrder = Math.max(
        0,
        ...(selectedElection.candidates || []).map((c: any) => c.order || 0)
      );

      await db.transact([
        tx.electionCandidates[candidateId]
          .update({
            name: currentUserProfile?.name || user.email || 'Unbenannt',
            description: '',
            imageURL: currentUserProfile?.avatar || '',
            order: maxOrder + 1,
            createdAt: now,
          })
          .link({
            election: selectedElection.id,
            user: user.id,
          }),
      ]);

      toast.success('Sie wurden erfolgreich als Kandidat hinzugefügt!');
      setConfirmDialogOpen(false);
      setSelectedElection(null);
    } catch (error) {
      console.error('Failed to add candidate:', error);
      toast.error('Fehler beim Hinzufügen des Kandidaten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <AvatarImage src={event.organizer?.avatar} />
            <AvatarFallback>{event.organizer?.name?.[0]?.toUpperCase() || 'O'}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">
              {t('components.labels.organizedBy')} {event.organizer?.name || 'Unknown'}
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
          { value: electionsCount, labelKey: 'components.labels.elections' },
          { value: amendmentsCount, labelKey: 'components.labels.amendments' },
          { value: openChangeRequestsCount, labelKey: 'components.labels.openChangeRequests' },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <SubscribeButton
          entityType="event"
          entityId={eventId}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          isLoading={subscribeLoading}
        />
        <MembershipButton
          actionType="participate"
          status={status}
          isMember={isParticipant}
          hasRequested={hasRequested}
          isInvited={isInvited}
          onRequest={requestParticipation}
          onLeave={leaveEvent}
          onAcceptInvitation={acceptInvitation}
          isLoading={participationLoading}
        />
        {elections.length > 0 && user && (
          <Button variant="outline" onClick={() => setElectionsDialogOpen(true)}>
            <Trophy className="mr-2 h-4 w-4" />
            Kandidieren
          </Button>
        )}
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

      {/* About Tab with Event Details */}
      {event.description && (
        <InfoTabs
          about={event.description}
          eventDetails={{
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            tags: event.tags,
          }}
          contact={{
            location: event.location,
          }}
          className="mb-12"
        />
      )}

      {/* Cut off Dates Card */}
      {event.amendment_cutoff_date && (
        <Card className={`mb-6 overflow-hidden ${GRADIENTS[0]}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cut off Dates / Fristen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border bg-background/80 p-4 shadow-sm backdrop-blur-sm">
              <span className="font-medium">Antragsfrist:</span>
              <span className="text-lg font-semibold">
                {new Date(event.amendment_cutoff_date).toLocaleString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Participants Card */}
      {event.public_participants && (
        <Card
          className={`mb-6 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${GRADIENTS[1]}`}
          onClick={() => setParticipantsDialogOpen(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants
            </CardTitle>
            <CardDescription>
              {event.participants?.length || 0} participant(s) - Click to view list
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Event Positions Carousel */}
      {event.eventPositions && event.eventPositions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Positions
            </CardTitle>
            <CardDescription>Positions for this event</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {event.eventPositions.map((position: any, index: number) => {
                  const holders = position.holders || [];
                  const filledSlots = holders.length;
                  const totalSlots = position.capacity || 1;

                  return (
                    <CarouselItem
                      key={position.id}
                      className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
                    >
                      <Card
                        className={`h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${GRADIENTS[index % GRADIENTS.length]}`}
                      >
                        <CardHeader className="space-y-3 pb-4">
                          <div className="flex items-start justify-between">
                            <CardTitle className="line-clamp-1 flex-1 text-xl">
                              {position.title}
                            </CardTitle>
                            <Badge variant="outline" className="ml-2 shrink-0">
                              {filledSlots}/{totalSlots}
                            </Badge>
                          </div>
                          {position.description && (
                            <CardDescription className="line-clamp-2">
                              {position.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-3">
                            {/* Display holders */}
                            {holders.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Current {holders.length === 1 ? 'Holder' : 'Holders'}
                                </p>
                                {holders.map((holder: any) => (
                                  <div
                                    key={holder.id}
                                    className="cursor-pointer rounded-lg border bg-background/80 p-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                    onClick={() => router.push(`/user/${holder.user?.id}`)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 ring-2 ring-background">
                                        <AvatarImage
                                          src={holder.user?.avatar}
                                          alt={holder.user?.name || 'User'}
                                        />
                                        <AvatarFallback>
                                          {holder.user?.name?.[0]?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                          {holder.user?.name || 'Unknown'}
                                        </p>
                                        {holder.user?.handle && (
                                          <p className="truncate text-sm text-muted-foreground">
                                            @{holder.user.handle}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-border/50 bg-background/50 p-4 text-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Vacant Position
                                </p>
                              </div>
                            )}
                            {/* Show election info if exists */}
                            {position.election && (
                              <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-muted-foreground">
                                    Election:
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {position.election.status || 'Scheduled'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Elections Selection Dialog */}
      <Dialog open={electionsDialogOpen} onOpenChange={setElectionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Wählen Sie eine Wahl aus</DialogTitle>
            <DialogDescription>
              Wählen Sie eine Wahl aus, für die Sie kandidieren möchten.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {elections.map((election: any, index: number) => {
              const existingCandidacy = getUserCandidacy(election);
              const gradientClass = GRADIENTS[index % GRADIENTS.length];

              return (
                <Card
                  key={election.id}
                  className={`cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${gradientClass} ${existingCandidacy ? 'opacity-60' : ''}`}
                  onClick={() => !existingCandidacy && handleElectionClick(election)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{election.title}</span>
                      {existingCandidacy && (
                        <Badge variant="secondary" className="text-xs">
                          Bereits Kandidat
                        </Badge>
                      )}
                    </CardTitle>
                    {election.description && (
                      <CardDescription>{election.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {election.position && (
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="text-sm font-medium">{election.position.title}</div>
                        {election.position.description && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {election.position.description}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Kandidaten: {election.candidates?.length || 0}</span>
                      {election.majorityType && (
                        <Badge variant="outline" className="text-xs">
                          {election.majorityType}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kandidatur bestätigen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich für diese Wahl kandidieren?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedElection && (
            <Card
              className={`overflow-hidden ${GRADIENTS[elections.indexOf(selectedElection) % GRADIENTS.length]}`}
            >
              <CardHeader>
                <CardTitle>{selectedElection.title}</CardTitle>
                {selectedElection.description && (
                  <CardDescription>{selectedElection.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedElection.position && (
                  <div className="rounded-md border bg-background/50 p-3">
                    <div className="text-sm font-semibold">
                      Position: {selectedElection.position.title}
                    </div>
                    {selectedElection.position.description && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selectedElection.position.description}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aktuelle Kandidaten:</span>
                    <span className="font-medium">{selectedElection.candidates?.length || 0}</span>
                  </div>
                  {selectedElection.majorityType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wahlverfahren:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedElection.majorityType}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCandidacy} disabled={isSubmitting}>
              {isSubmitting ? 'Wird hinzugefügt...' : 'Kandidatur bestätigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Participants Dialog */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Participants</DialogTitle>
            <DialogDescription>
              {event.participants?.length || 0} participant(s) registered for this event
            </DialogDescription>
          </DialogHeader>
          
          {event.eventType === 'delegate_conference' ? (
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="delegates">Delegates by Subgroup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="participants" className="space-y-4">
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  {event.participants && event.participants.length > 0 ? (
                    event.participants.map((participant: any) => (
                      <Card
                        key={participant.id}
                        className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                        onClick={() => router.push(`/user/${participant.user?.id}`)}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={participant.user?.avatar}
                              alt={participant.user?.name || 'User'}
                            />
                            <AvatarFallback>
                              {participant.user?.name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold leading-none">
                              {participant.user?.name || 'Unknown'}
                            </p>
                            {participant.user?.handle && (
                              <p className="text-sm text-muted-foreground">
                                @{participant.user.handle}
                              </p>
                            )}
                            {participant.status && (
                              <Badge variant="secondary" className="text-xs">
                                {participant.status}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center text-muted-foreground">
                      No participants yet
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="delegates" className="space-y-4">
                <DelegatesOverview eventId={event.id} groupId={event.group?.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              {event.participants && event.participants.length > 0 ? (
                event.participants.map((participant: any) => (
                  <Card
                    key={participant.id}
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => router.push(`/user/${participant.user?.id}`)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={participant.user?.avatar}
                          alt={participant.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {participant.user?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold leading-none">
                          {participant.user?.name || 'Unknown'}
                        </p>
                        {participant.user?.handle && (
                          <p className="text-sm text-muted-foreground">
                            @{participant.user.handle}
                          </p>
                        )}
                        {participant.status && (
                          <Badge variant="secondary" className="text-xs">
                            {participant.status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-muted-foreground">
                  No participants yet
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
