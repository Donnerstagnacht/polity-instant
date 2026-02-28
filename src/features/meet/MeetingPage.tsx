import { useNavigate } from '@tanstack/react-router';
import { StatsBar } from '@/features/shared/ui/ui/StatsBar';
import { InfoTabs } from '@/features/shared/ui/wiki/InfoTabs.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useMeetingData } from './hooks/useMeetingData';
import { useMeetingBooking } from './hooks/useMeetingBooking';
import { MeetingHeader } from './ui/MeetingHeader';
import { MeetingDetails } from './ui/MeetingDetails';
import { MeetingParticipants } from './ui/MeetingParticipants';
import { MeetingActions } from './ui/MeetingActions';

interface MeetingPageProps {
  meetingId: string;
}

export function MeetingPage({ meetingId }: MeetingPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { meetingSlot, isLoading, isOwner, hasBooked, bookingCount, isPast, isAvailable } =
    useMeetingData(meetingId);
  const { bookMeeting, cancelBooking } = useMeetingBooking();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">{t('features.meet.page.loadingMeeting')}</div>
      </div>
    );
  }

  if (!meetingSlot) {
    return (
      <div className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t('features.meet.page.notFound')}</h1>
        <p className="text-muted-foreground">
          {t('features.meet.page.notFoundDescription')}
        </p>
      </div>
    );
  }

  const handleBook = () => {
    bookMeeting(meetingSlot.id);
  };

  const handleCancelBooking = () => {
    const userBooking = meetingSlot.bookings?.find((b: any) => b.user?.id === meetingSlot.user?.id);
    if (userBooking) {
      cancelBooking(userBooking.id);
    }
  };

  return (
    <>
      <MeetingHeader
        title={(meetingSlot.title || 'Meeting') as string}
        isPublic={meetingSlot.meeting_type === 'public-meeting'}
        owner={(meetingSlot.user || { id: 'unknown', name: 'Unknown' }) as any}
        meetingType={meetingSlot.meeting_type ?? ''}
      />

      <StatsBar stats={[{ value: bookingCount, labelKey: 'Participants' }]} />

      <MeetingActions
        meetingId={meetingSlot.id}
        title={meetingSlot.title || 'Meeting'}
        description={meetingSlot.description || ''}
        isOwner={isOwner}
        hasBooked={hasBooked}
        isAvailable={isAvailable}
        isPast={isPast}
        onBook={handleBook}
        onCancelBooking={handleCancelBooking}
      onNavigateCalendar={() => navigate({ to: '/calendar' })}
      onNavigateEdit={() => navigate({ to: `/meet/${meetingSlot.id}/edit` })}
      />

      <MeetingDetails
        startTime={meetingSlot.start_time ?? 0}
        endTime={meetingSlot.end_time ?? 0}
        meetingType={meetingSlot.meeting_type ?? ''}
        isAvailable={isAvailable}
        isPast={isPast}
      />

      <MeetingParticipants bookings={[...(meetingSlot.bookings || [])].map(b => ({ ...b, id: b.id ?? '', status: b.status ?? '' }))} count={bookingCount} />

      {meetingSlot.description && (
        <InfoTabs about={meetingSlot.description} contact={{}} className="mb-12" />
      )}
    </>
  );
}
