'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '../../../db/db';
import { useRouter } from 'next/navigation';
import { StatsBar } from '@/components/ui/StatsBar';
import { ActionBar } from '@/components/ui/ActionBar';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { ShareButton } from '@/components/shared/ShareButton';
import { Calendar, Clock, Globe, Lock, Settings, UserPlus, UserMinus } from 'lucide-react';

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = db.useAuth();

  // Fetch meeting slot details
  const { data, isLoading } = db.useQuery({
    meetingSlots: {
      $: {
        where: {
          id: resolvedParams.id,
        },
      },
      owner: {},
      bookings: {
        booker: {},
      },
    },
  });

  const meetingSlot = data?.meetingSlots?.[0];

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    if (!meetingSlot) return '';
    const start = new Date(meetingSlot.startTime);
    const end = new Date(meetingSlot.endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    return `${durationMinutes} minutes`;
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading meeting...</div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!meetingSlot) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-6xl p-4">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Meeting Not Found</h1>
            <p className="text-muted-foreground">
              The meeting you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  const isOwner = meetingSlot.owner?.id === user?.id;
  const hasBooked = meetingSlot.bookings?.some((b: any) => b.booker?.id === user?.id);
  const bookingCount = meetingSlot.bookings?.length || 0;
  const isPast = new Date(meetingSlot.startTime) < new Date();
  const isAvailable = meetingSlot.isAvailable && !isPast;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto max-w-6xl p-4">
        {/* Header with centered title and subtitle */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold">{meetingSlot.title}</h1>
            {meetingSlot.isPublic ? (
              <Badge variant="default">
                <Globe className="mr-1 h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Lock className="mr-1 h-3 w-3" />
                Private
              </Badge>
            )}
          </div>

          {/* Owner Info */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={meetingSlot.owner?.avatar} />
              <AvatarFallback>{meetingSlot.owner?.name?.[0]?.toUpperCase() || 'O'}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">
                Hosted by {meetingSlot.owner?.name || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                {meetingSlot.meetingType.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={[{ value: bookingCount, labelKey: 'Participants' }]} />

        {/* Action Bar */}
        <ActionBar>
          {!isOwner && !hasBooked && isAvailable && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Book Meeting
            </Button>
          )}

          {hasBooked && !isPast && (
            <Button variant="outline">
              <UserMinus className="mr-2 h-4 w-4" />
              Cancel Booking
            </Button>
          )}

          <Button variant="outline" onClick={() => router.push('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            View in Calendar
          </Button>

          <ShareButton
            url={`/meet/${meetingSlot.id}`}
            title={meetingSlot.title || 'Meeting'}
            description={meetingSlot.description || ''}
          />

          {isOwner && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/meet/${meetingSlot.id}/edit`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </ActionBar>

        {/* Meeting Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time side by side */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(meetingSlot.startTime)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(meetingSlot.startTime)} - {formatTime(meetingSlot.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{getDuration()}</p>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="flex flex-wrap gap-2">
              {isAvailable ? (
                <Badge variant="default" className="bg-green-500">
                  Available
                </Badge>
              ) : isPast ? (
                <Badge variant="outline">Past Meeting</Badge>
              ) : (
                <Badge variant="destructive">Fully Booked</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {meetingSlot.meetingType.replace('-', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Participants Section */}
        {bookingCount > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Participants ({bookingCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetingSlot.bookings?.map((booking: any) => (
                  <div key={booking.id} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.booker?.avatar} />
                      <AvatarFallback>
                        {booking.booker?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{booking.booker?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        @{booking.booker?.handle || 'unknown'}
                      </p>
                      {booking.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium">Note:</span> {booking.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* About Tab */}
        {meetingSlot.description && (
          <InfoTabs about={meetingSlot.description} contact={{}} className="mb-12" />
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
