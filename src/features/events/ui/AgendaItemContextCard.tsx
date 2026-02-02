'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  Calendar,
  Vote,
  UserCheck,
  FileText,
  Users,
  Play,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

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
  // For elections
  position?: {
    id: string;
    title: string;
    description?: string;
    group?: {
      id: string;
      name: string;
    };
  };
  // For votes
  amendment?: {
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    workflowStatus?: string;
    imageURL?: string;
    group?: {
      id: string;
      name: string;
    };
  };
  className?: string;
}

/**
 * Get status configuration for display
 */
function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: Play,
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: CheckCircle2,
      };
    case 'planned':
    default:
      return {
        label: 'Planned',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        icon: Clock,
      };
  }
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
    case 'speech':
      return 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/50';
    default:
      return 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/50';
  }
}

/**
 * AgendaItemContextCard - Section 1: Header card showing context
 *
 * For Elections: Shows position information
 * For Votes: Shows amendment information
 * Also displays timing information (estimated, start, end, duration)
 */
export function AgendaItemContextCard({
  agendaItem,
  position,
  amendment,
  className,
}: AgendaItemContextCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;

  const statusConfig = getStatusConfig(agendaItem.status);
  const TypeIcon = getTypeIcon(agendaItem.type);
  const StatusIcon = statusConfig.icon;
  const gradientClass = getGradientClass(agendaItem.type);

  const isElection = agendaItem.type === 'election';
  const isVote = agendaItem.type === 'vote';

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
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="capitalize">{agendaItem.type}</span>
                {agendaItem.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {agendaItem.duration} {t('common.units.minutes')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge className={cn('flex items-center gap-1', statusConfig.className)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-4 p-4">
        {/* Election Context: Position Information */}
        {isElection && position && (
          <div className="rounded-lg border bg-rose-50/50 p-4 dark:bg-rose-950/20">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {t('features.events.agenda.electionFor')}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                <UserCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold">{position.title}</h3>
                {position.group && (
                  <Link
                    href={`/group/${position.group.id}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {position.group.name}
                  </Link>
                )}
              </div>
            </div>
            {position.description && (
              <p className="mt-3 text-sm text-muted-foreground">{position.description}</p>
            )}
          </div>
        )}

        {/* Vote Context: Amendment Information */}
        {isVote && amendment && (
          <Link
            href={`/amendment/${amendment.id}`}
            className="block rounded-lg border bg-orange-50/50 p-4 transition-colors hover:bg-orange-100/50 dark:bg-orange-950/20 dark:hover:bg-orange-900/30"
          >
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {t('features.events.agenda.voteOn')}
            </div>
            <div className="flex items-start gap-3">
              {amendment.imageURL ? (
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={amendment.imageURL} alt={amendment.title} />
                  <AvatarFallback className="rounded-lg bg-orange-100 dark:bg-orange-900/40">
                    <Vote className="h-6 w-6 text-orange-600" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                  <Vote className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{amendment.title}</h3>
                {amendment.subtitle && (
                  <p className="text-sm text-muted-foreground">{amendment.subtitle}</p>
                )}
                {amendment.group && (
                  <p className="mt-1 text-sm text-muted-foreground">{amendment.group.name}</p>
                )}
                {amendment.workflowStatus && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {amendment.workflowStatus.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Timing Information */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {agendaItem.scheduledTime && (
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {t('features.events.agenda.scheduled')}
              </div>
              <div className="text-sm font-medium">
                {format(new Date(agendaItem.scheduledTime), 'PPp', { locale })}
              </div>
            </div>
          )}

          {agendaItem.activatedAt && (
            <div className="rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" />
                {t('features.events.agenda.startedAt')}
              </div>
              <div className="text-sm font-medium">
                {format(new Date(agendaItem.activatedAt), 'p', { locale })}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(agendaItem.activatedAt), { addSuffix: true, locale })}
              </div>
            </div>
          )}

          {agendaItem.completedAt && (
            <div className="rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                {t('features.events.agenda.completedAt')}
              </div>
              <div className="text-sm font-medium">
                {format(new Date(agendaItem.completedAt), 'p', { locale })}
              </div>
            </div>
          )}

          {agendaItem.duration && (
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                {t('features.events.agenda.duration')}
              </div>
              <div className="text-sm font-medium">
                {agendaItem.duration} {t('common.units.minutes')}
              </div>
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
