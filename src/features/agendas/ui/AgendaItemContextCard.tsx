'use client';

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/features/shared/ui/ui/collapsible';
import { EditingModeBadge } from '@/features/shared/ui/ui/editing-mode.tsx';
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
  ChevronDown,
  ChevronRight,
  ScrollText,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';
import { addMinutes, format, formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
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
  /** Amendment data for amendment-type agenda items */
  amendment?: {
    id: string;
    title?: string | null;
    reason?: string | null;
    preamble?: string | null;
    editing_mode?: string | null;
    change_request_count?: number;
    collaborator_count?: number;
    group?: { id: string; name?: string | null } | null;
  } | null;
  /** Election data for election-type agenda items */
  election?: {
    id: string;
    title?: string | null;
    position?: {
      id: string;
      title?: string | null;
      description?: string | null;
      term?: string | null;
      group_id: string;
      group?: { id: string; name?: string | null } | null;
    } | null;
  } | null;
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
  amendment,
  election,
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
  const estimatedOngoingCompletedAt = getEstimatedEndTime(
    actualStartedAt,
    estimatedDurationMinutes
  );
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
                  type={
                    agendaItem.type as
                      | 'election'
                      | 'vote'
                      | 'speech'
                      | 'discussion'
                      | 'accreditation'
                  }
                />
                <AgendaStatusBadge
                  status={
                    agendaItem.status as
                      | 'completed'
                      | 'in-progress'
                      | 'pending'
                      | 'planned'
                      | 'active'
                  }
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {t('features.events.agenda.estimatedStartAt', 'Estimated to start at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedStartedAt, locale)}
              </div>
              <div className="text-muted-foreground text-xs">
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Play className="h-3 w-3" />
                {t('features.events.agenda.startedAt')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(actualStartedAt, locale)}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatRelativeTime(actualStartedAt)}
              </div>
            </div>
          )}

          {actualCompletedAt && isCompleted && (
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 shadow-sm">
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                {t('features.events.agenda.completedAt')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(actualCompletedAt, locale)}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatRelativeTime(actualCompletedAt)}
              </div>
              <AgendaEndedPill className="mt-3" endedAt={actualCompletedAt} />
            </div>
          )}

          {!isCompleted && estimatedCompletedAt && !isOngoing && (
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 shadow-sm">
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.estimatedCompleteAt', 'Estimated to complete at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedCompletedAt, locale)}
              </div>
              <div className="text-muted-foreground text-xs">
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.estimatedCompleteAt', 'Estimated to complete at')}
              </div>
              <div className="text-sm font-medium">
                {formatAgendaDateTime(estimatedOngoingCompletedAt, locale)}
              </div>
              <div className="text-muted-foreground text-xs">
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Vote className="h-3 w-3" />
                {t('features.events.agenda.votingStart', 'Voting Start')}
              </div>
              <div className="text-sm font-medium">
                {format(votingStartTime, 'PPp', { locale })}
              </div>
              <div className="text-muted-foreground text-xs">
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
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {t('features.events.agenda.votingEnd', 'Voting End')}
              </div>
              <div className="text-sm font-medium">{format(votingEndTime, 'PPp', { locale })}</div>
              <div className="text-muted-foreground text-xs">
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
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {agendaItem.description}
            </p>
          </div>
        )}

        {/* Amendment details (collapsible) */}
        {amendment && (
          <AmendmentDetailsSection amendment={amendment} />
        )}

        {/* Election / Position details (collapsible) */}
        {election?.position && (
          <ElectionDetailsSection election={election} />
        )}
      </CardContent>
    </Card>
  );
}

// ── Amendment collapsible details ───────────────────────────────────

function AmendmentDetailsSection({
  amendment,
}: {
  amendment: NonNullable<AgendaItemContextCardProps['amendment']>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border bg-muted/30">
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <span>{t('features.events.agenda.amendmentDetails', 'Amendment Details')}</span>
          {amendment.editing_mode && (
            <EditingModeBadge mode={amendment.editing_mode} variant="secondary" />
          )}
          <Link
            to="/amendment/$id"
            params={{ id: amendment.id }}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t('features.events.agenda.viewAmendment', 'View Amendment')}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t px-4 py-3">
            {amendment.title && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('common.title', 'Title')}
                </p>
                <p className="text-sm">{amendment.title}</p>
              </div>
            )}

            {amendment.reason && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('features.amendments.reason', 'Reason')}
                </p>
                <p className="text-sm whitespace-pre-wrap">{amendment.reason}</p>
              </div>
            )}

            {amendment.preamble && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('features.amendments.preamble', 'Preamble')}
                </p>
                <p className="text-sm whitespace-pre-wrap">{amendment.preamble}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {amendment.group?.name && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="mr-1 h-3 w-3" />
                  {amendment.group.name}
                </Badge>
              )}
              {typeof amendment.change_request_count === 'number' && amendment.change_request_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {amendment.change_request_count} {t('features.amendments.changeRequests', 'Change Requests')}
                </Badge>
              )}
              {typeof amendment.collaborator_count === 'number' && amendment.collaborator_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  {amendment.collaborator_count} {t('features.amendments.collaborators', 'Collaborators')}
                </Badge>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Election / Position collapsible details ─────────────────────────

function ElectionDetailsSection({
  election,
}: {
  election: NonNullable<AgendaItemContextCardProps['election']>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const position = election.position;
  const group = position?.group;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border bg-muted/30">
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          <span>{t('features.events.agenda.positionDetails', 'Position Details')}</span>
          {group && (
            <Link
              to="/group/$id"
              params={{ id: group.id }}
              className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {group.name ?? t('features.events.agenda.viewGroup', 'View Group')}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t px-4 py-3">
            {position?.title && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('features.events.agenda.position', 'Position')}
                </p>
                <p className="text-sm">{position.title}</p>
              </div>
            )}

            {position?.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('common.description', 'Description')}
                </p>
                <p className="text-sm whitespace-pre-wrap">{position.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {position?.term && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  {t('features.events.agenda.term', 'Term')}: {position.term}
                </Badge>
              )}
              {group?.name && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="mr-1 h-3 w-3" />
                  {group.name}
                </Badge>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
