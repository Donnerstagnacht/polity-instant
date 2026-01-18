import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { formatMeetingDate, formatMeetingTime, formatMeetingType } from '../utils/meetingFormatters';
import { calculateDuration, getMeetingStatus } from '../utils/meetingUtils';

interface MeetingDetailsProps {
  startTime: string | number;
  endTime: string | number;
  meetingType: string;
  isAvailable: boolean;
  isPast: boolean;
}

export function MeetingDetails({
  startTime,
  endTime,
  meetingType,
  isAvailable,
  isPast,
}: MeetingDetailsProps) {
  const { t } = useTranslation();
  const duration = calculateDuration(startTime, endTime);
  const status = getMeetingStatus(isAvailable, isPast);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('features.meet.page.meetingDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatMeetingDate(startTime)}</p>
              <p className="text-sm text-muted-foreground">
                {formatMeetingTime(startTime)} - {formatMeetingTime(endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('features.meet.page.duration')}</p>
              <p className="text-sm text-muted-foreground">{duration}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {formatMeetingType(meetingType)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
