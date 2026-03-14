import { useNavigate } from '@tanstack/react-router';
import { StatsBar } from '@/features/shared/ui/ui/StatsBar';
import { InfoTabs } from '@/features/shared/ui/wiki/InfoTabs.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useMeetingData } from './hooks/useMeetingData';
import { useMeetingActions } from '@/zero/events/useMeetingActions';
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
  const { event, isLoading, isOwner, hasBooked, bookingCount, isPast, isAvailable } =
    useMeetingData(meetingId);
  const { bookMeeting, cancelMeetingBooking } = useMeetingActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">{t('features.meet.page.loadingMeeting')}</div>
      </div>
    );
  }

  if (!event) {
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
    bookMeeting(event.id);
  };

  const handleCancelBooking = () => {
    cancelMeetingBooking(event.id);
  };

  const creator = event.creator as { id: string; first_name?: string | null; avatar?: string | null } | undefined;
  const participants = (event.participants ?? []).map((p) => ({
    id: p.id ?? '',
    status: p.status ?? '',
    booker: p.user ? {
      id: p.user.id,
      name: p.user.first_name ?? undefined,
      handle: p.user.handle ?? undefined,
      avatar: p.user.avatar ?? undefined,
    } : undefined,
  })).filter((p) => p.booker?.id !== event.creator_id);

  return (
    <>
      <MeetingHeader
        title={(event.title || 'Meeting') as string}
        isPublic={event.meeting_type === 'public-meeting'}
        owner={{
          id: creator?.id ?? 'unknown',
          name: creator?.first_name ?? 'Unknown',
          avatar: creator?.avatar ?? undefined,
        }}
        meetingType={event.meeting_type ?? ''}
      />

      <StatsBar stats={[{ value: bookingCount, labelKey: 'Participants' }]} />

      <MeetingActions
        meetingId={event.id}
        title={event.title || 'Meeting'}
        description={event.description || ''}
        isOwner={isOwner}
        hasBooked={hasBooked}
        isAvailable={isAvailable}
        isPast={isPast}
        onBook={handleBook}
        onCancelBooking={handleCancelBooking}
        onNavigateCalendar={() => navigate({ to: '/calendar' })}
        onNavigateEdit={() => navigate({ to: `/event/${event.id}` })}
      />

      <MeetingDetails
        startTime={event.start_date ?? 0}
        endTime={event.end_date ?? 0}
        meetingType={event.meeting_type ?? ''}
        isAvailable={isAvailable}
        isPast={isPast}
      />

      <MeetingParticipants bookings={participants} count={bookingCount} />

      {event.description && (
        <InfoTabs about={event.description} contact={{}} className="mb-12" />
      )}
    </>
  );
}
