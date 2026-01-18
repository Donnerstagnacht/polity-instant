'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Scale,
  BookOpen,
  User,
  MessageSquare,
  Vote,
  FileEdit,
  Plus,
  ExternalLink,
  CheckCircle2,
  UserPlus,
  FileText,
  Heart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { useTranslation } from '@/hooks/use-translation';

export function TimelineEventCard({ event, index = 0 }: TimelineEventCardProps) {
  const { t } = useTranslation();

  const eventTypeConfig = {
    created: {
      icon: Plus,
      label: t('features.timeline.eventTypes.created'),
      variant: 'default' as const,
      color: 'text-green-600',
      borderColor: 'border-l-green-500',
      bgGradient: 'bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20',
      bgColor: 'bg-green-500',
    },
    updated: {
      icon: FileEdit,
      label: t('features.timeline.eventTypes.updated'),
      variant: 'secondary' as const,
      color: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      bgGradient: 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20',
      bgColor: 'bg-blue-500',
    },
    comment_added: {
      icon: MessageSquare,
      label: t('features.timeline.eventTypes.comment_added'),
      variant: 'outline' as const,
      color: 'text-purple-600',
      borderColor: 'border-l-purple-500',
      bgGradient: 'bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20',
      bgColor: 'bg-purple-500',
    },
    vote_started: {
      icon: Vote,
      label: t('features.timeline.eventTypes.vote_started'),
      variant: 'destructive' as const,
      color: 'text-red-600',
      borderColor: 'border-l-red-500',
      bgGradient: 'bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20',
      bgColor: 'bg-red-500',
    },
    participant_joined: {
      icon: UserPlus,
      label: t('features.timeline.eventTypes.participant_joined'),
      variant: 'default' as const,
      color: 'text-green-600',
      borderColor: 'border-l-green-500',
      bgGradient: 'bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20',
      bgColor: 'bg-green-500',
    },
    status_changed: {
      icon: CheckCircle2,
      label: t('features.timeline.eventTypes.status_changed'),
      variant: 'secondary' as const,
      color: 'text-orange-600',
      borderColor: 'border-l-orange-500',
      bgGradient: 'bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20',
      bgColor: 'bg-orange-500',
    },
    published: {
      icon: FileText,
      label: t('features.timeline.eventTypes.published'),
      variant: 'default' as const,
      color: 'text-green-600',
      borderColor: 'border-l-green-500',
      bgGradient: 'bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20',
      bgColor: 'bg-green-500',
    },
    member_added: {
      icon: UserPlus,
      label: t('features.timeline.eventTypes.member_added'),
      variant: 'default' as const,
      color: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      bgGradient: 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20',
      bgColor: 'bg-blue-500',
    },
  } as const;

  const entityTypeConfig = {
    user: {
      icon: User,
      label: t('features.timeline.types.user'),
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    group: {
      icon: Users,
      label: t('features.timeline.types.group'),
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    amendment: {
      icon: Scale,
      label: t('features.timeline.types.amendment'),
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
    event: {
      icon: Calendar,
      label: t('features.timeline.types.event'),
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
    blog: {
      icon: BookOpen,
      label: t('features.timeline.types.blog'),
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    },
  } as const;

  type EventTypeKey = keyof typeof eventTypeConfig;
  type EntityTypeKey = keyof typeof entityTypeConfig;

  const eventConfig = eventTypeConfig[event.eventType as EventTypeKey] || eventTypeConfig.updated;
  const entityConfig = entityTypeConfig[event.entityType as EntityTypeKey] || entityTypeConfig.user;

  const EventIcon = eventConfig.icon;
  const EntityIcon = entityConfig.icon;

  const actorName = event.actor?.name || 'Unknown User';
  const actorAvatar = event.actor?.avatar;

  // Get entity-specific information
  const getEntityInfo = () => {
    switch (event.entityType) {
      case 'amendment':
        return {
          name: event.amendment?.title || t('features.timeline.types.amendment'),
          subtitle: event.amendment?.user?.name ? `${t('features.timeline.card.by')} ${event.amendment.user.name}` : undefined,
        };
      case 'event':
        return {
          name: event.event?.title || t('features.timeline.types.event'),
          subtitle: event.event?.startDate
            ? new Date(event.event.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : undefined,
        };
      case 'blog':
        return {
          name: event.blog?.title || 'Blog Post',
          subtitle: event.blog?.user?.name ? `${t('features.timeline.card.by')} ${event.blog.user.name}` : undefined,
        };
      case 'group':
        return {
          name: event.group?.name || t('features.timeline.types.group'),
          subtitle: undefined,
        };
      case 'user':
        return {
          name: event.user?.name || t('features.timeline.types.user'),
          subtitle: undefined,
        };
      default:
        return { name: 'Unknown', subtitle: undefined };
    }
  };

  const entityInfo = getEntityInfo();

  // Get entity link based on type
  const getEntityLink = () => {
    switch (event.entityType) {
      case 'amendment':
        return event.amendment?.id ? `/amendment/${event.amendment.id}` : null;
      case 'event':
        return event.event?.id ? `/event/${event.event.id}` : null;
      case 'blog':
        return event.blog?.id ? `/blog/${event.blog.id}` : null;
      case 'group':
        return event.group?.id ? `/group/${event.group.id}` : null;
      case 'user':
        return event.user?.id ? `/user/${event.user.id}` : null;
      default:
        return null;
    }
  };

  const entityLink = getEntityLink();

  // Try to find a cover image
  const coverImage =
    (event.entityType === 'group' && event.group?.imageURL) ||
    (event.entityType === 'event' && event.event?.imageURL) ||
    null;

  // Get gradient class for this card
  const gradientClass = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card
      className={`group h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${gradientClass}`}
    >
      <CardContent className="flex h-full flex-col p-0">
        {/* Hero image section if available */}
        {coverImage && (
          <div className="relative h-40 w-full overflow-hidden">
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* Type badges overlay */}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              <Badge variant={eventConfig.variant} className="gap-1 bg-white/90 backdrop-blur">
                <EventIcon className="h-3 w-3" />
                {eventConfig.label}
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-white/90 backdrop-blur">
                <EntityIcon className="h-3 w-3" />
                {entityConfig.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="flex flex-1 flex-col p-4">
          {/* Header with badges (only if no cover image) */}
          {!coverImage && (
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={eventConfig.variant} className="gap-1">
                <EventIcon className="h-3 w-3" />
                {eventConfig.label}
              </Badge>
              <Badge variant="secondary" className={`gap-1 ${entityConfig.color}`}>
                <EntityIcon className="h-3 w-3" />
                {entityConfig.label}
              </Badge>
            </div>
          )}

          {/* Title and subtitle */}
          <div className="mb-3 flex-1">
            <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-tight text-foreground">
              {event.title}
            </h3>
            {entityInfo.subtitle && (
              <p className="text-xs text-muted-foreground">{entityInfo.subtitle}</p>
            )}
            {event.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>

          {/* Entity-specific details */}
          {event.entityType === 'event' && event.event && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
              {event.event.startDate && (
                <div className="flex items-center gap-1 font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(event.event.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
              {event.event.location && (
                <span className="text-muted-foreground">{event.event.location}</span>
              )}
            </div>
          )}

          {event.entityType === 'group' && event.group && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{event.group.memberCount ?? '—'} {t('features.timeline.card.members')}</span>
            </div>
          )}

          {event.entityType === 'blog' && event.blog && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span className="font-medium">{event.blog.likeCount ?? 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{event.blog.commentCount ?? 0}</span>
              </span>
            </div>
          )}

          {event.entityType === 'amendment' && event.amendment && (
            <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
              {event.amendment.status && (
                <span className="font-semibold">{t('features.timeline.card.status')}: {event.amendment.status}</span>
              )}
            </div>
          )}

          {/* Metadata highlights */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {Object.entries(event.metadata)
                .slice(0, 2)
                .map(([key, value]) => {
                  let displayValue = String(value);
                  if (key.includes('Date') || key.includes('Time')) {
                    try {
                      displayValue = new Date(value as string).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    } catch {
                      // Keep original
                    }
                  }

                  return (
                    <span
                      key={key}
                      className="rounded-md border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {displayValue}
                    </span>
                  );
                })}
            </div>
          )}

          {/* Footer with actor and timestamp */}
          <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-background">
                <AvatarImage src={actorAvatar} alt={actorName} />
                <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                  {actorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{actorName}</span>
            </div>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* View link */}
          {entityLink && (
            <Button variant="outline" size="sm" className="mt-3 w-full gap-2" asChild>
              <Link href={entityLink}>
                {t('features.timeline.card.viewDetails')}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineEventCardProps {
  event: {
    id: string;
    eventType: string;
    entityType: string;
    title: string;
    description?: string;
    createdAt: Date | string;
    metadata?: Record<string, unknown>;
    actor?: {
      id: string;
      name?: string;
      avatar?: string;
    };
    user?: { id: string; name?: string; avatar?: string };
    group?: { id: string; name?: string; imageURL?: string; memberCount?: number };
    amendment?: {
      id: string;
      title?: string;
      status?: string;
      user?: { name?: string };
    };
    event?: {
      id: string;
      title?: string;
      startDate?: Date | string;
      location?: string;
      imageURL?: string;
    };
    blog?: {
      id: string;
      title?: string;
      likeCount?: number;
      commentCount?: number;
      user?: { name?: string };
    };
  };
  index?: number;
}
