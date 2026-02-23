'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, UserCheck, Users, Video, Building2, MapPin, Repeat } from 'lucide-react';
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
import { GRADIENTS } from '@/features/users/state/gradientColors';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { extractHashtags } from '@/zero/common/hashtagHelpers';
import { StatsBar } from '@/components/ui/StatsBar';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';
import { DelegatesOverview } from '@/features/delegates/ui/DelegatesOverview';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useEventWikiPage } from './hooks/useEventWikiPage';

interface EventWikiProps {
  eventId: string;
}

export function EventWiki({ eventId }: EventWikiProps) {
  const { t } = useTranslation();
  const {
    navigate,
    user,
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
    participation,
    event,
    agendaStats,
    elections,
    electionsDialogOpen,
    setElectionsDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen,
    selectedElection,
    isSubmitting,
    participantsDialogOpen,
    setParticipantsDialogOpen,
    getUserCandidacy,
    handleElectionClick,
    handleConfirmCandidacy,
  } = useEventWikiPage(eventId);

  if (!event) {
    return (
      <div>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { electionsCount, amendmentsCount, openChangeRequestsCount } = agendaStats;

  return (
    <div>
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{event.title}</h1>
          {event.is_public ? (
            <Badge variant="default">{t('components.badges.public')}</Badge>
          ) : (
            <Badge variant="secondary">{t('components.badges.private')}</Badge>
          )}
          {event.recurrence_pattern && (
            <Badge variant="outline">
              <Repeat className="mr-1 h-3 w-3" />
              {event.recurrence_pattern === 'daily' ? 'Täglich' :
               event.recurrence_pattern === 'weekly' ? 'Wöchentlich' :
               event.recurrence_pattern === 'monthly' ? 'Monatlich' :
               event.recurrence_pattern === 'yearly' ? 'Jährlich' :
               event.recurrence_pattern === 'four-yearly' ? '4 Jährig' : event.recurrence_pattern}
            </Badge>
          )}
        </div>

        {/* Organizer Info */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={event.creator?.avatar ?? undefined} />
            <AvatarFallback>{event.creator?.first_name?.[0]?.toUpperCase() || 'O'}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">
              {t('components.labels.organizedBy')} {event.creator?.first_name || 'Unknown'}
            </p>
            {event.group && (
              <p className="text-xs text-muted-foreground">
                {t('components.labels.partOf')} {event.group.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar
        stats={[
          { value: participation.participantCount, labelKey: 'components.labels.participants' },
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
          status={participation.status as any}
          isMember={participation.isParticipant}
          hasRequested={participation.hasRequested}
          isInvited={participation.isInvited}
          onRequest={participation.requestParticipation}
          onLeave={participation.leaveEvent}
          onAcceptInvitation={participation.acceptInvitation}
          isLoading={participation.isLoading}
        />
        {elections.length > 0 && user && (
          <Button variant="outline" onClick={() => setElectionsDialogOpen(true)}>
            <Trophy className="mr-2 h-4 w-4" />
            Kandidieren
          </Button>
        )}
        <ShareButton
          url={`/event/${eventId}`}
          title={event.title ?? ''}
          description={event.description || ''}
        />
      </ActionBar>

      {/* Hashtags */}
      {event.event_hashtags && event.event_hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={extractHashtags(event.event_hashtags)} centered />
        </div>
      )}

      {/* About Tab with Event Details */}
      {event.description && (
        <InfoTabs
          about={event.description}
          eventDetails={{
            startDate: event.start_date ?? undefined,
            endDate: event.end_date ?? undefined,
            location: event.location_name ?? undefined,
          }}
          contact={{
            location: event.location_name ?? undefined,
          }}
          className="mb-12"
        />
      )}



      {/* Location Card */}
      {event.location_type && (
        <Card className={`mb-6 overflow-hidden ${GRADIENTS[2]}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {event.location_type === 'online' ? (
                <Video className="h-5 w-5" />
              ) : event.location_type === 'physical' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
              {event.location_type === 'online' ? 'Online Meeting' : 'Veranstaltungsort'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.location_type === 'online' ? (
              <>
                {event.location_url && (
                  <div className="flex items-center justify-between rounded-lg border bg-background/80 p-4 shadow-sm backdrop-blur-sm">
                    <span className="font-medium">Meeting Link:</span>
                    <a 
                      href={event.location_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[60%]"
                    >
                      {event.location_url}
                    </a>
                  </div>
                )}

              </>
            ) : event.location_type === 'physical' ? (
              <div className="rounded-lg border bg-background/80 p-4 shadow-sm backdrop-blur-sm space-y-2">
                {event.location_name && (
                  <p className="font-semibold text-lg">{event.location_name}</p>
                )}
                {event.location_address && (
                  <p className="text-muted-foreground">
                    {event.location_address}
                  </p>
                )}
              </div>
            ) : event.location_name ? (
              <div className="flex items-center gap-2 rounded-lg border bg-background/80 p-4 shadow-sm backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location_name}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Public Participants Card */}
      {event.is_public && (
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
      {event.event_positions && event.event_positions.length > 0 && (
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
                {event.event_positions.map((position: any, index: number) => {
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
                                    onClick={() => navigate({ to: `/user/${holder.user?.id}` })}
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
          
          {event.event_type === 'delegate_conference' ? (
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
                        onClick={() => navigate({ to: `/user/${participant.user?.id}` })}
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
                    onClick={() => navigate({ to: `/user/${participant.user?.id}` })}
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
