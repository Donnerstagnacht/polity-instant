'use client';

import { Link } from '@tanstack/react-router';
import { UserCheck, Vote, Users, FileText, ShieldCheck, ScrollText, Building2 } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Badge } from '@/features/shared/ui/ui/badge';
import { cn } from '@/features/shared/utils/utils';
import { CountdownTimer, EndedAgo } from '@/features/decision-terminal/ui/CountdownTimer';
import type { AgendaItemStatus, AgendaItemType } from './AgendaCard';

type AgendaVisualStatus = AgendaItemStatus | 'active';
type AgendaCountdownTone = 'start' | 'active' | 'end' | 'completed';

function getAgendaStatusConfig(
  status: AgendaVisualStatus,
  t: ReturnType<typeof useTranslation>['t']
) {
  switch (status) {
    case 'active':
    case 'in-progress':
      return {
        label: t('features.events.agenda.active'),
        emoji: '🟢',
        colorClass: 'border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-400',
        pulseClass: status === 'active' ? 'animate-pulse' : '',
      };
    case 'completed':
      return {
        label: t('features.events.agenda.statusCompleted'),
        emoji: '✅',
        colorClass: 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400',
        pulseClass: '',
      };
    case 'pending':
      return {
        label: t('features.events.agenda.statusPending'),
        emoji: '⚪',
        colorClass: 'border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300',
        pulseClass: '',
      };
    case 'planned':
    default:
      return {
        label: t('features.events.agenda.statusPlanned'),
        emoji: '🟡',
        colorClass: 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400',
        pulseClass: '',
      };
  }
}

function getAgendaTypeConfig(type: AgendaItemType, t: ReturnType<typeof useTranslation>['t']) {
  switch (type) {
    case 'election':
      return {
        label: t('features.events.agenda.typeElection'),
        icon: UserCheck,
        colorClass: 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400',
      };
    case 'vote':
      return {
        label: t('features.events.agenda.typeVote'),
        icon: Vote,
        colorClass: 'border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-400',
      };
    case 'accreditation':
      return {
        label: t('features.events.agenda.typeAccreditation', 'Accreditation'),
        icon: ShieldCheck,
        colorClass: 'border-teal-500/30 bg-teal-500/15 text-teal-700 dark:text-teal-400',
      };
    case 'speech':
      return {
        label: t('features.events.agenda.typeSpeech'),
        icon: Users,
        colorClass: 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-400',
      };
    case 'discussion':
    default:
      return {
        label: t('features.events.agenda.typeDiscussion'),
        icon: FileText,
        colorClass: 'border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-400',
      };
  }
}

function getCountdownToneClasses(tone: AgendaCountdownTone) {
  switch (tone) {
    case 'start':
      return 'border-amber-500/30 bg-amber-500/10';
    case 'active':
      return 'border-green-500/30 bg-green-500/10';
    case 'completed':
      return 'border-slate-500/25 bg-slate-500/10';
    case 'end':
    default:
      return 'border-blue-500/30 bg-blue-500/10';
  }
}

export function AgendaStatusBadge({
  status,
  className,
}: {
  status: AgendaVisualStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  const config = getAgendaStatusConfig(status, t);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[11px] font-bold tracking-wide uppercase',
        config.colorClass,
        config.pulseClass,
        className
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  );
}

export function AgendaTypeBadge({ type, className }: { type: AgendaItemType; className?: string }) {
  const { t } = useTranslation();
  const config = getAgendaTypeConfig(type, t);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[11px] font-bold tracking-wide uppercase',
        config.colorClass,
        className
      )}
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

/**
 * Clickable entity badge for related amendment or position/group.
 * Follows the same visual style as AgendaTypeBadge.
 */
export function AgendaEntityBadge({
  label,
  href,
  variant,
  className,
}: {
  label: string;
  href: string;
  variant: 'amendment' | 'position';
  className?: string;
}) {
  const Icon = variant === 'amendment' ? ScrollText : Building2;
  const colorClass =
    variant === 'amendment'
      ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/25'
      : 'border-pink-500/30 bg-pink-500/15 text-pink-700 dark:text-pink-400 hover:bg-pink-500/25';

  return (
    <Link to={href} onClick={e => e.stopPropagation()}>
      <Badge
        variant="outline"
        className={cn(
          'cursor-pointer font-mono text-[11px] font-bold tracking-wide uppercase transition-colors',
          colorClass,
          className
        )}
      >
        <Icon className="mr-1 h-3.5 w-3.5" />
        {label}
      </Badge>
    </Link>
  );
}

export function AgendaCountdownPill({
  label,
  endsAt,
  tone = 'end',
  className,
}: {
  label: string;
  endsAt: Date | string;
  tone?: AgendaCountdownTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border px-3 py-2 shadow-sm',
        getCountdownToneClasses(tone),
        className
      )}
    >
      <CountdownTimer endsAt={endsAt} compact showIcon={false} compactLabel={label} />
    </div>
  );
}

export function AgendaEndedPill({
  endedAt,
  className,
}: {
  endedAt: Date | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-slate-500/25 bg-slate-500/10 px-3 py-2 shadow-sm',
        className
      )}
    >
      <EndedAgo endedAt={endedAt} className="font-mono text-[11px] tracking-wide uppercase" />
    </div>
  );
}
