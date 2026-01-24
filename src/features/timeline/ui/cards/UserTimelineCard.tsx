'use client';

import { User, Users, MapPin, Mail, Bell, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { Button } from '@/components/ui/button';
import { useSubscribeUser } from '@/features/user/hooks/useSubscribeUser';
import { CONTENT_TYPE_CONFIG } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface UserTimelineCardProps {
  user: {
    id: string;
    name: string;
    handle?: string;
    bio?: string;
    subtitle?: string;
    avatarUrl?: string;
    location?: string;
    groupCount?: number;
    amendmentCount?: number;
    hashtags?: { id: string; tag: string }[];
  };
  onFollow?: () => void;
  onMessage?: () => void;
  className?: string;
}

/**
 * UserTimelineCard - The User Profile card
 *
 * Displays a user with:
 * - Gradient header
 * - Avatar and name/handle
 * - Bio (max 3 lines)
 * - Location and group count
 * - Actions: Follow, Message, View Profile
 */
export function UserTimelineCard({ user, onFollow, onMessage, className }: UserTimelineCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const subscription = useSubscribeUser(user.id);
  const amendmentStyle = CONTENT_TYPE_CONFIG.amendment;

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <TimelineCardBase contentType="user" className={className} href={`/user/${user.id}`}>
      <TimelineCardHeader
        contentType="user"
        title={user.name}
        badge={<TimelineCardBadge label={t('features.timeline.contentTypes.user')} icon={User} />}
      />

      <TimelineCardContent>
        {/* Avatar and handle */}
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            {user.handle && (
              <p className="truncate text-xs text-muted-foreground">@{user.handle}</p>
            )}
            {user.subtitle && (
              <p className="truncate text-xs text-muted-foreground">{user.subtitle}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{user.bio}</p>}

        {/* Hashtags */}
        {user.hashtags && user.hashtags.length > 0 && (
          <div className="mb-3" onClick={e => e.preventDefault()}>
            <HashtagDisplay
              hashtags={user.hashtags.slice(0, 3)}
              centered={false}
              badgeClassName={`border bg-white/70 dark:bg-gray-900/60 ${amendmentStyle.borderColor} ${amendmentStyle.accentColor}`}
            />
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{user.location}</span>
            </div>
          )}
          {user.groupCount !== undefined && user.groupCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>
                {user.groupCount} {t('features.timeline.cards.groups')}
              </span>
            </div>
          )}
        </div>

        {/* Stats Bar with Tooltips */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-1">
                <Bell className="h-3.5 w-3.5" />
                <span className="font-medium">{subscription.subscriberCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {subscription.subscriberCount ?? 0} {t('features.timeline.cards.subscribers')}
              </p>
            </TooltipContent>
          </Tooltip>
          {user.groupCount !== undefined && user.groupCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{user.groupCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {user.groupCount} {t('features.timeline.cards.groups')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {user.amendmentCount !== undefined && user.amendmentCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span className="font-medium">{user.amendmentCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {user.amendmentCount} {t('features.timeline.contentTypes.amendment')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <Button
          variant={subscription.isSubscribed ? 'outline' : 'ghost'}
          size="sm"
          onClick={e => {
            e.preventDefault();
            subscription.toggleSubscribe();
            onFollow?.();
          }}
          disabled={subscription.isLoading}
          className="flex items-center gap-1.5"
        >
          <Bell className={`h-3.5 w-3.5 ${subscription.isSubscribed ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={e => {
            e.preventDefault();
            router.push(
              `/messages?userId=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.name)}`
            );
            onMessage?.();
          }}
          className="flex items-center gap-1.5"
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={`/user/${user.id}`}
            title={user.name}
            description={user.bio || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
