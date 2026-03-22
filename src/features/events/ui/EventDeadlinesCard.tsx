import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Clock, CalendarClock } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface DeadlineItem {
  label: string;
  timestamp: number | null | undefined;
}

interface EventDeadlinesCardProps {
  registrationDeadline?: number | null;
  amendmentDeadline?: number | null;
  candidacyDeadline?: number | null;
}

function formatDeadlineDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeRemaining(timestamp: number): { text: string; isPast: boolean } {
  const now = Date.now();
  const diff = timestamp - now;
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return { text: `${days}d ${hours}h`, isPast };
  }
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${hours}h ${minutes}m`, isPast };
}

export function EventDeadlinesCard({
  registrationDeadline,
  amendmentDeadline,
  candidacyDeadline,
}: EventDeadlinesCardProps) {
  const { t } = useTranslation();

  const deadlines: DeadlineItem[] = [
    {
      label: t('features.events.deadlines.registration', 'Registration Deadline'),
      timestamp: registrationDeadline,
    },
    {
      label: t('features.events.deadlines.amendment', 'Amendment Deadline'),
      timestamp: amendmentDeadline,
    },
    {
      label: t('features.events.deadlines.candidacy', 'Candidacy Deadline'),
      timestamp: candidacyDeadline,
    },
  ].filter(d => d.timestamp != null);

  if (deadlines.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          {t('features.events.deadlines.title', 'Deadlines')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map(deadline => {
          const remaining = getTimeRemaining(deadline.timestamp!);
          return (
            <div
              key={deadline.label}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{deadline.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDeadlineDate(deadline.timestamp!)}
                </p>
              </div>
              <Badge
                variant={remaining.isPast ? 'destructive' : 'secondary'}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {remaining.isPast
                  ? t('features.events.deadlines.expired', 'Expired')
                  : remaining.text}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
