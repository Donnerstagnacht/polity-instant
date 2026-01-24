'use client';

import {
  Zap,
  UserPlus,
  Vote,
  Play,
  UserCheck,
  ArrowRight,
  Users,
  Calendar,
  ScrollText,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';
import { getContentTypeGradient } from '../../constants/content-type-config';

export type ActionType =
  | 'user_joined_group'
  | 'vote_started'
  | 'event_going_live'
  | 'collaborator_added'
  | 'amendment_forwarded'
  | 'group_created'
  | 'election_started'
  | 'member_promoted'
  | 'amendment_passed'
  | 'amendment_rejected';

export interface ActionActor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ActionEntity {
  id: string;
  type: 'group' | 'event' | 'amendment' | 'election' | 'user';
  name: string;
  url: string;
}

export interface ActionTimelineCardProps {
  action: {
    id: string;
    type: ActionType;
    actors: ActionActor[];
    sourceEntity?: ActionEntity;
    targetEntity?: ActionEntity;
    timestamp: string | Date;
    metadata?: {
      roleName?: string;
      fromGroup?: string;
      toGroup?: string;
    };
  };
  onViewDetails?: () => void;
  className?: string;
}

/**
 * Action type configuration
 */
const ACTION_CONFIG: Record<
  ActionType,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
  }
> = {
  user_joined_group: {
    icon: <UserPlus className="h-4 w-4" />,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  vote_started: {
    icon: <Vote className="h-4 w-4" />,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  event_going_live: {
    icon: <Play className="h-4 w-4" />,
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  collaborator_added: {
    icon: <UserCheck className="h-4 w-4" />,
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  amendment_forwarded: {
    icon: <ArrowRight className="h-4 w-4" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  group_created: {
    icon: <Users className="h-4 w-4" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  election_started: {
    icon: <Calendar className="h-4 w-4" />,
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  member_promoted: {
    icon: <Zap className="h-4 w-4" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  amendment_passed: {
    icon: <ScrollText className="h-4 w-4" />,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  amendment_rejected: {
    icon: <ScrollText className="h-4 w-4" />,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Actor avatars component
 */
function ActorAvatars({ actors, maxDisplay = 3 }: { actors: ActionActor[]; maxDisplay?: number }) {
  const displayActors = actors.slice(0, maxDisplay);
  const remaining = actors.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayActors.map(actor => (
        <Avatar key={actor.id} className="h-8 w-8 border-2 border-background">
          <AvatarImage src={actor.avatarUrl} alt={actor.name} />
          <AvatarFallback className="bg-gray-100 text-xs dark:bg-gray-800">
            {getInitials(actor.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gray-100 text-xs font-medium dark:bg-gray-800">
          +{remaining}
        </div>
      )}
    </div>
  );
}

/**
 * Entity link component
 */
function EntityLink({ entity }: { entity: ActionEntity }) {
  const iconMap = {
    group: <Users className="h-3.5 w-3.5" />,
    event: <Calendar className="h-3.5 w-3.5" />,
    amendment: <ScrollText className="h-3.5 w-3.5" />,
    election: <Vote className="h-3.5 w-3.5" />,
    user: <UserPlus className="h-3.5 w-3.5" />,
  };

  return (
    <Link
      href={entity.url}
      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {iconMap[entity.type]}
      <span className="max-w-[120px] truncate">{entity.name}</span>
    </Link>
  );
}

/**
 * ActionTimelineCard - Meta Activity card
 *
 * Displays system activities and meta events:
 * - User joined group
 * - Vote started on amendment
 * - Event going live
 * - New collaborator added
 * - Amendment forwarded
 * - Group created
 * - Election started
 * - Member promoted
 */
export function ActionTimelineCard({ action, onViewDetails, className }: ActionTimelineCardProps) {
  const { t } = useTranslation();
  const config = ACTION_CONFIG[action.type];
  const gradient = getContentTypeGradient('action');
  const timestamp =
    typeof action.timestamp === 'string' ? new Date(action.timestamp) : action.timestamp;

  // Build action message based on type
  const getActionMessage = () => {
    const actorNames =
      action.actors.length > 0
        ? action.actors.length === 1
          ? action.actors[0].name
          : action.actors.length === 2
            ? `${action.actors[0].name} and ${action.actors[1].name}`
            : `${action.actors[0].name} and ${action.actors.length - 1} others`
        : '';

    switch (action.type) {
      case 'user_joined_group':
        return t('features.timeline.cards.action.userJoinedGroup', {
          actor: actorNames,
          defaultValue: `${actorNames} joined`,
        });
      case 'vote_started':
        return t('features.timeline.cards.action.voteStarted', {
          defaultValue: 'Vote started on',
        });
      case 'event_going_live':
        return t('features.timeline.cards.action.eventGoingLive', {
          defaultValue: 'Event is now live',
        });
      case 'collaborator_added':
        return t('features.timeline.cards.action.collaboratorAdded', {
          actor: actorNames,
          defaultValue: `${actorNames} added as collaborator on`,
        });
      case 'amendment_forwarded':
        return t('features.timeline.cards.action.amendmentForwarded', {
          defaultValue: 'Amendment forwarded',
        });
      case 'group_created':
        return t('features.timeline.cards.action.groupCreated', {
          actor: actorNames,
          defaultValue: `${actorNames} created`,
        });
      case 'election_started':
        return t('features.timeline.cards.action.electionStarted', {
          defaultValue: 'Election started for',
        });
      case 'member_promoted':
        return t('features.timeline.cards.action.memberPromoted', {
          actor: actorNames,
          role: action.metadata?.roleName || 'admin',
          defaultValue: `${actorNames} promoted to ${action.metadata?.roleName || 'admin'}`,
        });
      case 'amendment_passed':
        return t('features.timeline.cards.action.amendmentPassed', {
          defaultValue: 'Amendment passed',
        });
      case 'amendment_rejected':
        return t('features.timeline.cards.action.amendmentRejected', {
          defaultValue: 'Amendment rejected',
        });
      default:
        return '';
    }
  };

  return (
    <TimelineCardBase contentType="action" className={className}>
      {/* Gradient accent bar at top */}
      <div className={cn('h-1', gradient)} />

      <TimelineCardContent className="p-4">
        <div className="flex gap-3">
          {/* Action icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              config.iconBg,
              config.iconColor
            )}
          >
            {config.icon}
          </div>

          {/* Action content */}
          <div className="min-w-0 flex-1">
            {/* Actor avatars */}
            {action.actors.length > 0 && (
              <div className="mb-2">
                <ActorAvatars actors={action.actors} />
              </div>
            )}

            {/* Action message */}
            <p className="text-sm">
              <span className="font-medium">{getActionMessage()}</span>
            </p>

            {/* Entity links */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {action.sourceEntity && <EntityLink entity={action.sourceEntity} />}
              {action.sourceEntity && action.targetEntity && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {action.targetEntity && <EntityLink entity={action.targetEntity} />}
            </div>

            {/* Forwarding metadata */}
            {action.type === 'amendment_forwarded' &&
              action.metadata?.fromGroup &&
              action.metadata?.toGroup && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('features.timeline.cards.action.from')} {action.metadata.fromGroup}{' '}
                  {t('features.timeline.cards.action.to')} {action.metadata.toGroup}
                </p>
              )}

            {/* Timestamp */}
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      </TimelineCardContent>

      {/* Actions */}
      {(onViewDetails || action.sourceEntity) && (
        <TimelineCardActions>
          {onViewDetails && (
            <TimelineCardActionButton
              onClick={onViewDetails}
              variant="outline"
              size="sm"
              label={t('features.timeline.cards.viewDetails')}
            />
          )}

          {action.sourceEntity && (
            <Link href={action.sourceEntity.url} passHref>
              <TimelineCardActionButton
                variant="ghost"
                size="sm"
                className="ml-auto"
                icon={ExternalLink}
                label=""
              />
            </Link>
          )}
        </TimelineCardActions>
      )}
    </TimelineCardBase>
  );
}

export default ActionTimelineCard;
