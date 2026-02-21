'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2, Play, Loader2 } from 'lucide-react';
import { useAgendaNavigation } from '../hooks/useAgendaNavigation';
import { useTranslation } from '@/hooks/use-translation';

interface AgendaNavigationControlsProps {
  eventId: string;
}

export function AgendaNavigationControls({ eventId }: AgendaNavigationControlsProps) {
  const { t } = useTranslation();
  const {
    currentAgendaItem,
    currentIndex,
    totalItems,
    canNavigate,
    isLoading,
    moveToNextItem,
    moveToPreviousItem,
    completeCurrentItem,
    hasNextItem,
    hasPreviousItem,
  } = useAgendaNavigation(eventId);

  // Only show for users who can manage agenda
  if (!canNavigate) {
    return null;
  }

  const progressPercentage = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('features.events.navigation.progress', 'Agenda Progress')}
            </span>
            <Badge variant="secondary">
              {currentIndex + 1} / {totalItems}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />

          {/* Current item display */}
          {currentAgendaItem ? (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span className="truncate font-medium">
                {t('features.events.navigation.currentItem', 'Current')}: {currentAgendaItem.title}
              </span>
              <Badge
                variant={
                  currentAgendaItem.status === 'in-progress'
                    ? 'default'
                    : currentAgendaItem.status === 'completed'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {currentAgendaItem.status}
              </Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t(
                'features.events.navigation.notActivated',
                'No active agenda item. Click an item to activate.'
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={moveToPreviousItem}
              disabled={!hasPreviousItem || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {t('features.events.navigation.previous', 'Previous')}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={completeCurrentItem}
              disabled={!currentAgendaItem || isLoading}
              className="max-w-[200px] flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {t('features.events.navigation.complete', 'Complete')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={moveToNextItem}
              disabled={!hasNextItem || isLoading}
            >
              {t('features.events.navigation.next', 'Next')}
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
