import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Video, Building2, Repeat } from 'lucide-react';
import db from '../../../../db/db';
import { useEventParticipation } from '@/features/events/hooks/useEventParticipation';
import { MembershipButton } from '@/components/shared/action-buttons/MembershipButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';

interface EventSearchCardProps {
  event: any;
  showParticipationButton?: boolean;
}

export function EventSearchCard({ event, showParticipationButton = false }: EventSearchCardProps) {
  const { user } = db.useAuth();
  
  // Use the participation hook when button is enabled
  const participationHook = useEventParticipation(event.id);
  
  const formatEventDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Find current user's participation to get their status
  const userParticipation = event.participants?.find(
    (p: any) => p.user?.id === user?.id
  );
  
  const participantStatus = showParticipationButton ? participationHook.status : userParticipation?.status;
  
  // Use hook's participant count if button is shown, otherwise calculate from event data
  const participantCount = showParticipationButton 
    ? participationHook.participantCount 
    : event.participants
      ? event.participants.filter(
          (p: any) => p.status === 'member' || p.status === 'admin' || p.status === 'confirmed'
        ).length
      : 0;

  return (
    <Card className="group cursor-pointer overflow-hidden transition-colors hover:bg-accent">
      <a href={`/event/${event.id}`} className="block">
        {event.imageURL && (
          <div className="aspect-video w-full overflow-hidden">
            <img src={event.imageURL} alt={event.title} className="h-full w-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              Event
            </Badge>
            {event.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            {participantStatus && (
              <Badge 
                variant={participantStatus === 'member' || participantStatus === 'admin' || participantStatus === 'confirmed' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {participantStatus === 'member' || participantStatus === 'confirmed' ? 'Participant' : 
                 participantStatus === 'admin' ? 'Organizer' :
                 participantStatus === 'invited' ? 'Invited' :
                 participantStatus === 'requested' ? 'Requested' : participantStatus}
              </Badge>
            )}
            {event.recurringPattern && (
              <Badge variant="secondary" className="text-xs">
                <Repeat className="mr-1 h-3 w-3" />
                {event.recurringPattern === 'daily' ? 'Täglich' :
                 event.recurringPattern === 'weekly' ? 'Wöchentlich' :
                 event.recurringPattern === 'monthly' ? 'Monatlich' :
                 event.recurringPattern === 'yearly' ? 'Jährlich' :
                 event.recurringPattern === 'four-yearly' ? '4 Jährig' : event.recurringPattern}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <CardDescription>
            {formatEventDate(event.startDate)} at {formatEventTime(event.startDate)}
          </CardDescription>
        </CardHeader>
      </a>
      <CardContent className="space-y-2">
        {/* Location with type-specific icons */}
        {(event.location || event.locationType) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {event.locationType === 'online' ? (
              <Video className="h-4 w-4" />
            ) : event.locationType === 'physical' ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="truncate">
              {event.locationType === 'online' 
                ? (event.onlineMeetingLink || 'Online') 
                : event.locationType === 'physical'
                  ? [event.locationName, event.city].filter(Boolean).join(', ') || event.location || 'Vor Ort'
                  : event.location}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participantCount} participants</span>
        </div>
        {event.group && (
          <p className="text-xs text-muted-foreground">Organized by {event.group.name}</p>
        )}
        {event.hashtags && event.hashtags.length > 0 && (
          <div className="pt-2">
            <HashtagDisplay hashtags={event.hashtags.slice(0, 3)} />
          </div>
        )}
        {/* Participation Button - only shown when enabled */}
        {showParticipationButton && (
          <div className="pt-2">
            <MembershipButton
              actionType="participate"
              status={participationHook.status === 'confirmed' ? 'member' : participationHook.status}
              isMember={participationHook.isParticipant}
              hasRequested={participationHook.hasRequested}
              isInvited={participationHook.isInvited}
              onRequest={participationHook.requestParticipation}
              onLeave={participationHook.leaveEvent}
              onAcceptInvitation={participationHook.acceptInvitation}
              isLoading={participationHook.isLoading}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
