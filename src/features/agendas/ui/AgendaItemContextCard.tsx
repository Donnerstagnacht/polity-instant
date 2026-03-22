'use client';

import { Card, CardContent } from '@/features/shared/ui/ui/card';
import {
  Clock,
  Calendar,
  Vote,
  UserCheck,
  FileText,
  Users,
  ShieldCheck,
  Play,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { addMinutes, format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import {
  AgendaCountdownPill,
  AgendaEndedPill,
  AgendaStatusBadge,
  AgendaTypeBadge,
} from './AgendaBadges';

interface AgendaItemContextCardProps {
  agendaItem: {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    duration?: number;
    scheduledTime?: string;
    startTime?: Date;
    endTime?: Date;
    activatedAt?: Date;
    completedAt?: Date;
  };
  /** Voting/election opening time (when voting starts) */
  votingStartTime?: Date;
  /** Voting/election closing time (when voting ends) */
  votingEndTime?: Date;
  className?: string;
}

function formatAgendaDateTime(date: Date, locale: Locale) {
  return format(date, 'dd.MM.yyyy p', { locale });
}

function getEstimatedEndTime(startAt?: Date, durationMinutes?: number | null) {
  if (!startAt || !durationMinutes) {
    return undefined;
  }

  return addMinutes(startAt, durationMinutes);
}

/**
 * Get type icon
 */
function getTypeIcon(type: string) {
  switch (type) {
    case 'election':
      return UserCheck;
    case 'vote':
      return Vote;
    case 'accreditation':
      return ShieldCheck;
    case 'speech':
      return Users;
    case 'discussion':
    default:
      return FileText;
  }
}

/**
 * Get gradient class based on type
 */
function getGradientClass(type: string) {
  switch (type) {
    case 'election':
      return 'bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/50';
    case 'vote':
      return 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/50';
    case 'accreditation':
      return 'bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/50';
    case 'speech':
      return 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/50';
    default:
      return 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/50';
  }
}

/**
 * AgendaItemContextCard - Section 1: Header card showing context
 *
 * Shows agenda item context and timing information.
 */
export function AgendaItemContextCard({
  agendaItem,
  votingStartTime,
  votingEndTime,
  className,
}: AgendaItemContextCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;
  const TypeIcon = getTypeIcon(agendaItem.type);
  const gradientClass = getGradientClass(agendaItem.type);

  const durationMinutes =
    typeof agendaItem.duration === 'number' && agendaItem.duration > 0 ? agendaItem.duration : null;
  const estimatedDurationMinutes = durationMinutes ?? 30;
  const scheduledAt = agendaItem.scheduledTime ? new Date(agendaItem.scheduledTime) : undefined;
  const actualStartedAt = agendaItem.activatedAt ?? agendaItem.startTime;
  const actualCompletedAt = agendaItem.completedAt ?? agendaItem.endTime;
  const estimatedStartedAt = scheduledAt ?? agendaItem.startTime;
  const estimatedCompletedAt = getEstimatedEndTime(estimatedStartedAt, estimatedDurationMinutes);
  const estimatedOngoingCompletedAt = getEstimatedEndTime(actualStartedAt, estimatedDurationMinutes);
  const isCompleted = agendaItem.status === 'completed' || !!actualCompletedAt;
  const isOngoing =
    !isCompleted && (agendaItem.status === 'in-progress' || agendaItem.status === 'active');
  const now = Date.now();

  const formatRelativeTime = (value: Date) => {
    return formatDistanceToNow(value, { addSuffix: true, locale });
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Gradient Header */}
      <div className={cn('p-4', gradientClass)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-200">
              <TypeIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {agendaItem.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <AgendaTypeBadge
                  type={agendaItem.type as 'election' | 'vote' | 'speech' | 'discussion' | 'accreditation'}
                />
                <AgendaStatusBadge
                  status={agendaItem.status as 'completed' | 'in-progress' | 'pending' | 'planned' | 'active'}
                />
                {durationMinutes && (
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
                    <Timer className="h-3 w-3" />
                    {durationMinutes} {t('common.minutes')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-4">
        {/* Timing Information */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {!isCompleted && !isOngoing && estimatedStartedAt && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {t('features.events.agenda.estimatedStartAt', 'Estimated to start at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedStartedAt, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(estimatedStartedAt)}
              </div>
              {estimatedStartedAt.getTime() > now ? (
                <AgendaCountdownPill
                  className="mt-3"
                  label={t('features.events.stream.startsIn', 'Starts in')}
                  endsAt={estimatedStartedAt}
                  tone="start"
                />
              ) : null}
            </div>
          )}

          {actualStartedAt && (isCompleted || isOngoing) && (
            <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" />
                {t('features.events.agenda.startedAt')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(actualStartedAt, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(actualStartedAt)}
              </div>
            </div>
          )}

          {actualCompletedAt && isCompleted && (
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                {t('features.events.agenda.completedAt')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(actualCompletedAt, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(actualCompletedAt)}
              </div>
              <AgendaEndedPill className="mt-3" endedAt={actualCompletedAt} />
            </div>
          )}

          {!isCompleted && estimatedCompletedAt && !isOngoing && (
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.estimatedCompleteAt', 'Estimated to complete at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedCompletedAt, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(estimatedCompletedAt)}
              </div>
              {estimatedCompletedAt.getTime() > now ? (
                <AgendaCountdownPill
                  className="mt-3"
                  label={t('features.events.agenda.endsIn', 'Ends in')}
                  endsAt={estimatedCompletedAt}
                  tone="end"
                />
              ) : null}
            </div>
          )}

          {!isCompleted && isOngoing && estimatedOngoingCompletedAt && (
            <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.estimatedCompleteAt', 'Estimated to complete at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedOngoingCompletedAt, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(estimatedOngoingCompletedAt)}
              </div>
              {estimatedOngoingCompletedAt.getTime() > now ? (
                <AgendaCountdownPill
                  className="mt-3"
                  label={t('features.events.agenda.endsIn', 'Ends in')}
                  endsAt={estimatedOngoingCompletedAt}
                  tone="active"
                />
              ) : null}
            </div>
          )}

          {durationMinutes && (
            <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                {t('features.events.agenda.duration')}
              </div>
              <div className="text-sm font-medium">
                {durationMinutes} {t('common.minutes')}
              </div>
            </div>
          )}

          {votingStartTime && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Vote className="h-3 w-3" />
                {t('features.events.agenda.votingStart', 'Voting Start')}
              </div>
              <div className="text-sm font-medium">
                {format(votingStartTime, 'PPp', { locale })}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(votingStartTime)}
              </div>
              {votingStartTime.getTime() > now ? (
                <AgendaCountdownPill
                  className="mt-3"
                  label={t('features.events.stream.startsIn', 'Starts in')}
                  endsAt={votingStartTime}
                  tone="start"
                />
              ) : null}
            </div>
          )}

          {votingEndTime && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.votingEnd', 'Voting End')}
              </div>
              <div className="text-sm font-medium">
                {format(votingEndTime, 'PPp', { locale })}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(votingEndTime)}
              </div>
              {votingEndTime.getTime() > now ? (
                <AgendaCountdownPill
                  className="mt-3"
                  label={t('features.events.agenda.endsIn', 'Ends in')}
                  endsAt={votingEndTime}
                  tone="end"
                />
              ) : (
                <AgendaEndedPill className="mt-3" endedAt={votingEndTime} />
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {agendaItem.description && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {agendaItem.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
