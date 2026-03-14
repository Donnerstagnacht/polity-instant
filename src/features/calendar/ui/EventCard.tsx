import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Clock, MapPin, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { CalendarEvent } from '../types/calendar.types';
import { formatTime } from '../logic/dateUtils';
import { getBaseEventId } from '../logic/eventIdUtils';

interface EventCardProps {
  event: CalendarEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const participantCount = event.participants?.length || 0;
  const userIsParticipant = event.participants?.some((p: any) => p.user?.id === user?.id);
  const userIsOrganizer = event.organizer?.id === user?.id;
  const isMeeting = event.isMeeting || false;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent"
      onClick={() => {
        const baseEventId = getBaseEventId(event.id);
        if (isMeeting) {
          navigate({ to: `/meet/${baseEventId}` });
        } else {
          navigate({ to: `/event/${baseEventId}` });
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {event.imageURL && !isMeeting && (
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <img src={event.imageURL} alt={event.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{event.title}</h3>
              <div className="flex gap-1">
                {isMeeting && (
                  <Badge variant="outline" className="text-xs">
                    {t('features.calendar.eventCard.meeting')}
                  </Badge>
                )}
                {event.isPublic ? (
                  <Badge variant="secondary" className="text-xs">
                    {t('features.calendar.eventCard.public')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {t('features.calendar.eventCard.private')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {!isMeeting && (
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {participantCount === 1
                      ? t('features.calendar.eventCard.participant', { count: participantCount })
                      : t('features.calendar.eventCard.participantPlural', {
                          count: participantCount,
                        })}
                  </span>
                </div>
              )}
            </div>

            {event.organizer && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.organizer.avatar} />
                  <AvatarFallback className="text-xs">
                    {event.organizer.name?.[0]?.toUpperCase() || 'O'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {event.organizer.name || t('features.calendar.eventCard.unknown')}
                </span>
              </div>
            )}

            {!isMeeting && (userIsParticipant || userIsOrganizer) && (
              <Badge variant="default" className="text-xs">
                {userIsOrganizer
                  ? t('features.calendar.eventCard.youreOrganizing')
                  : t('features.calendar.eventCard.youreAttending')}
              </Badge>
            )}
            {isMeeting && userIsOrganizer && (
              <Badge variant="default" className="text-xs">
                {t('features.calendar.eventCard.yourMeeting')}
              </Badge>
            )}
            {isMeeting && !userIsOrganizer && (
              <Badge variant="default" className="text-xs">
                {t('features.calendar.eventCard.youBookedThis')}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
