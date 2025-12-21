import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  booker?: {
    id: string;
    name?: string;
    handle?: string;
    avatar?: string;
  };
  notes?: string;
  status: string;
}

interface MeetingParticipantsProps {
  bookings: Booking[];
  count: number;
}

export function MeetingParticipants({ bookings, count }: MeetingParticipantsProps) {
  if (count === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Participants ({count})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={booking.booker?.avatar} />
                <AvatarFallback>{booking.booker?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
  );
}
