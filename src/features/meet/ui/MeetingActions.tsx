import { Button } from '@/components/ui/button';
import { ActionBar } from '@/components/ui/ActionBar';
import { ShareButton } from '@/components/shared/ShareButton';
import { Calendar, Settings, UserPlus, UserMinus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface MeetingActionsProps {
  meetingId: string;
  title: string;
  description: string;
  isOwner: boolean;
  hasBooked: boolean;
  isAvailable: boolean;
  isPast: boolean;
  onBook?: () => void;
  onCancelBooking?: () => void;
  onNavigateCalendar: () => void;
  onNavigateEdit: () => void;
}

export function MeetingActions({
  meetingId,
  title,
  description,
  isOwner,
  hasBooked,
  isAvailable,
  isPast,
  onBook,
  onCancelBooking,
  onNavigateCalendar,
  onNavigateEdit,
}: MeetingActionsProps) {
  const { t } = useTranslation();

  return (
    <ActionBar>
      {!isOwner && !hasBooked && isAvailable && onBook && (
        <Button onClick={onBook}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('features.meet.page.bookMeeting')}
        </Button>
      )}

      {hasBooked && !isPast && onCancelBooking && (
        <Button variant="outline" onClick={onCancelBooking}>
          <UserMinus className="mr-2 h-4 w-4" />
          {t('features.meet.page.cancelBooking')}
        </Button>
      )}

      <Button variant="outline" onClick={onNavigateCalendar}>
        <Calendar className="mr-2 h-4 w-4" />
        {t('features.meet.page.viewInCalendar')}
      </Button>

      <ShareButton url={`/meet/${meetingId}`} title={title} description={description} />

      {isOwner && (
        <Button variant="outline" size="icon" onClick={onNavigateEdit}>
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </ActionBar>
  );
}
