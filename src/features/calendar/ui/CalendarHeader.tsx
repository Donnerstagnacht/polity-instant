import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CalendarView } from '../types';
import { useTranslation } from '@/hooks/use-translation';

interface CalendarHeaderProps {
  view: CalendarView;
  setView: (view: CalendarView) => void;
  currentViewTitle: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  view,
  setView,
  currentViewTitle,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('features.calendar.title')}</h1>
          <p className="text-muted-foreground">{t('features.calendar.description')}</p>
        </div>
        <Button onClick={() => router.push('/create/event')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('features.calendar.actions.createEvent')}
        </Button>
      </div>

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

        <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
          <TabsList>
            <TabsTrigger value="day">
              <List className="mr-2 h-4 w-4" />
              {t('features.calendar.views.day')}
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
};
