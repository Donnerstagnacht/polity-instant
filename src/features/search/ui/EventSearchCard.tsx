import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import db from '../../../../db/db';

interface EventSearchCardProps {
  event: any;
}

export function EventSearchCard({ event }: EventSearchCardProps) {
  const { user } = db.useAuth();
  
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
  
  const participantStatus = userParticipation?.status;
  
  // Filter participants to only count 'member' and 'admin' statuses (matching EventWiki behavior)
  const participantCount = event.participants
    ? event.participants.filter(
        (p: any) => p.status === 'member' || p.status === 'admin'
      ).length
    : 0;

  return (
    <a href={`/event/${event.id}`} className="block">
      <Card className="cursor-pointer transition-colors hover:bg-accent">
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
                variant={participantStatus === 'member' || participantStatus === 'admin' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {participantStatus === 'member' ? 'Participant' : 
                 participantStatus === 'admin' ? 'Organizer' :
                 participantStatus === 'invited' ? 'Invited' :
                 participantStatus === 'requested' ? 'Requested' : participantStatus}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <CardDescription>
            {formatEventDate(event.startDate)} at {formatEventTime(event.startDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participantCount} participants</span>
          </div>
          {event.group && (
            <p className="text-xs text-muted-foreground">Organized by {event.group.name}</p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
