import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MapPin, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { db } from '../../../../db/db';
import { CalendarEvent } from '../types';
import { formatTime } from '../utils/dateUtils';
import { getBaseEventId } from '../utils/eventIdUtils';

interface EventCardProps {
  event: CalendarEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = db.useAuth();

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
          router.push(`/meet/${baseEventId}`);
        } else {
          router.push(`/event/${baseEventId}`);
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
                {t('features.calendar.eventCard.yourMeetingSlot')}
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
