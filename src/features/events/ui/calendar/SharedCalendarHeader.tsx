import { Button } from '@/features/shared/ui/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import {
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { CalendarViewMode } from '@/features/events/hooks/useCalendarView';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface SharedCalendarHeaderProps {
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  currentViewTitle: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Optional extra actions (e.g. "Create Event" button) rendered at the top-right */
  actions?: React.ReactNode;
  /** Optional title override (defaults to calendar.title i18n key) */
  title?: string;
}

export function SharedCalendarHeader({
  viewMode,
  setViewMode,
  currentViewTitle,
  onPrevious,
  onNext,
  onToday,
  actions,
  title,
}: SharedCalendarHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onToday}>
            {t('features.calendar.today')}
          </Button>
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold">{currentViewTitle}</h2>
        </div>

        <Tabs value={viewMode} onValueChange={v => setViewMode(v as CalendarViewMode)}>
          <TabsList>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              {t('features.calendar.views.list')}
            </TabsTrigger>
            <TabsTrigger value="week">
              <Grid3x3 className="mr-2 h-4 w-4" />
              {t('features.calendar.views.week')}
            </TabsTrigger>
            <TabsTrigger value="month">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {t('features.calendar.views.month')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
}
