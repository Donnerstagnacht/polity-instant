import { useRouter } from 'next/navigation';
import { StatsBar } from '@/components/ui/StatsBar';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useTranslation } from '@/hooks/use-translation';
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
  const router = useRouter();
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
    const userBooking = meetingSlot.bookings?.find((b: any) => b.booker?.id === meetingSlot.owner?.id);
    if (userBooking) {
      cancelBooking(userBooking.id);
    }
  };

  return (
    <>
      <MeetingHeader
        title={(meetingSlot.title || 'Meeting') as string}
        isPublic={meetingSlot.isPublic}
        owner={(meetingSlot.owner || { id: 'unknown', name: 'Unknown' }) as any}
        meetingType={meetingSlot.meetingType}
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
        onNavigateCalendar={() => router.push('/calendar')}
        onNavigateEdit={() => router.push(`/meet/${meetingSlot.id}/edit`)}
      />

      <MeetingDetails
        startTime={meetingSlot.startTime}
        endTime={meetingSlot.endTime}
        meetingType={meetingSlot.meetingType}
        isAvailable={isAvailable}
        isPast={isPast}
      />

      <MeetingParticipants bookings={meetingSlot.bookings || []} count={bookingCount} />

      {meetingSlot.description && (
        <InfoTabs about={meetingSlot.description} contact={{}} className="mb-12" />
      )}
    </>
  );
}
