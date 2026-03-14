import { Button } from '@/features/shared/ui/ui/button';
import { Download } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { downloadICalFile } from '@/features/events/logic/icalExport';
import type { CalendarEvent } from '@/features/events/hooks/useCalendarView';

interface CalendarExportButtonProps {
  events: CalendarEvent[];
  filename?: string;
}

export function CalendarExportButton({ events, filename }: CalendarExportButtonProps) {
  const { t } = useTranslation();

  const handleExport = () => {
    const icalEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description ?? null,
      location_name: e.location ?? null,
      start_date: typeof e.startDate === 'number' ? e.startDate : new Date(e.startDate).getTime(),
      end_date: typeof e.endDate === 'number' ? e.endDate : new Date(e.endDate).getTime(),
      creator: e.organizer ? { name: e.organizer.name } : null,
    }));
    downloadICalFile(icalEvents, filename);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      {t('features.calendar.actions.export')}
    </Button>
  );
}
