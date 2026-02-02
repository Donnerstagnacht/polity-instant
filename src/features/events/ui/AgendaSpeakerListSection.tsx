'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Plus, Users, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';

interface Speaker {
  id: string;
  order: number;
  time: number;
  completed: boolean;
  title?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

interface AgendaSpeakerListSectionProps {
  speakers: Speaker[];
  isUserInSpeakerList: boolean;
  canManageSpeakers: boolean;
  isAddingSpeaker: boolean;
  userId?: string;
  onAddToSpeakerList: () => void;
  onMarkCompleted?: (speakerId: string) => void;
  className?: string;
}

/**
 * AgendaSpeakerListSection - Section 2: Speakers List
 *
 * Displays:
 * - Current speakers list with order and speaking time
 * - Button to join the speaker list
 * - Dialog showing all registered speakers with profile links
 * - Mark as completed controls for organizers
 */
export function AgendaSpeakerListSection({
  speakers,
  isUserInSpeakerList,
  canManageSpeakers,
  isAddingSpeaker,
  userId,
  onAddToSpeakerList,
  onMarkCompleted,
  className,
}: AgendaSpeakerListSectionProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedSpeakers = [...speakers].sort((a, b) => a.order - b.order);
  const activeSpeakers = sortedSpeakers.filter(s => !s.completed);
  const completedSpeakers = sortedSpeakers.filter(s => s.completed);
  const currentSpeaker = activeSpeakers[0];

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5" />
            {t('features.events.agenda.speakerList')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {speakers.length > 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Users className="h-4 w-4" />
                    {speakers.length}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{t('features.events.agenda.speakerList')}</DialogTitle>
                    <DialogDescription>
                      {t('features.events.agenda.speakerListDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Active Speakers */}
                  {activeSpeakers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {t('features.events.agenda.upcomingSpeakers')} ({activeSpeakers.length})
                      </h4>
                      <div className="space-y-2">
                        {activeSpeakers.map((speaker, index) => (
                          <SpeakerCard
                            key={speaker.id}
                            speaker={speaker}
                            position={index + 1}
                            isCurrent={index === 0}
                            canManage={canManageSpeakers}
                            onMarkCompleted={onMarkCompleted}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Speakers */}
                  {completedSpeakers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {t('features.events.agenda.completedSpeakers')} ({completedSpeakers.length})
                      </h4>
                      <div className="space-y-2 opacity-60">
                        {completedSpeakers.map(speaker => (
                          <SpeakerCard key={speaker.id} speaker={speaker} isCompleted />
                        ))}
                      </div>
                    </div>
                  )}

                  {speakers.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {t('features.events.agenda.speakerListEmpty')}
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Speaker Highlight */}
        {currentSpeaker && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
              {t('features.events.agenda.currentSpeaker')}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={currentSpeaker.user?.avatar} />
                  <AvatarFallback>
                    {(currentSpeaker.user?.name ||
                      currentSpeaker.user?.email)?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/user/${currentSpeaker.user?.id}`}
                    className="font-medium hover:underline"
                  >
                    {currentSpeaker.user?.name || currentSpeaker.user?.email}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {currentSpeaker.time} {t('common.units.minutes')}
                  </div>
                </div>
              </div>
              {canManageSpeakers && onMarkCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkCompleted(currentSpeaker.id)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('features.events.agenda.markCompleted')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Waiting Queue Preview */}
        {activeSpeakers.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('features.events.agenda.waitingInQueue')}:
            </span>
            <div className="flex -space-x-2">
              {activeSpeakers.slice(1, 5).map(speaker => (
                <Avatar key={speaker.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={speaker.user?.avatar} />
                  <AvatarFallback className="text-xs">
                    {(speaker.user?.name || speaker.user?.email)?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeSpeakers.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{activeSpeakers.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add to Speaker List Button */}
        <Button
          onClick={onAddToSpeakerList}
          disabled={isUserInSpeakerList || !userId || isAddingSpeaker}
          variant={isUserInSpeakerList ? 'outline' : 'default'}
          className="w-full"
        >
          {isUserInSpeakerList ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('features.events.agenda.alreadyOnList')}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {isAddingSpeaker
                ? t('common.loading.default')
                : t('features.events.agenda.joinSpeakerList')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Individual Speaker Card
 */
function SpeakerCard({
  speaker,
  position,
  isCurrent,
  isCompleted,
  canManage,
  onMarkCompleted,
}: {
  speaker: Speaker;
  position?: number;
  isCurrent?: boolean;
  isCompleted?: boolean;
  canManage?: boolean;
  onMarkCompleted?: (speakerId: string) => void;
}) {
  const { t } = useTranslation();
  const speakerName = speaker.user?.name || speaker.user?.email || t('common.unknown');

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-3 transition-colors',
        isCurrent && 'border-primary bg-primary/5',
        isCompleted && 'bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3">
        {position && !isCompleted && (
          <Badge variant={isCurrent ? 'default' : 'secondary'} className="w-8 justify-center">
            {position}
          </Badge>
        )}
        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        <Link href={`/user/${speaker.user?.id}`} className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={speaker.user?.avatar} />
            <AvatarFallback>{speakerName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hover:underline">{speakerName}</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Clock className="mr-1 h-3 w-3" />
          {speaker.time} min
        </Badge>
        {canManage && onMarkCompleted && !isCompleted && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onMarkCompleted(speaker.id)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
