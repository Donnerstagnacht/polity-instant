'use client';

import { Card, CardContent } from '@/features/shared/ui/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar.tsx';
import { Badge } from '@/features/shared/ui/ui/badge.tsx';
import {
  Users,
  Calendar,
  FileText,
  User,
  MessageSquare,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useUserState } from '@/zero/users/useUserState.ts';
import { useGroupState } from '@/zero/groups/useGroupState.ts';
import { useEventState } from '@/zero/events/useEventState.ts';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState.ts';
import { useBlogState } from '@/zero/blogs/useBlogState.ts';
import { useStatementState } from '@/zero/statements/useStatementState.ts';
import { useTodoState } from '@/zero/todos/useTodoState.ts';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';

interface LinkPreviewProps {
  url: string;
  className?: string;
}

type EntityType = 'user' | 'group' | 'event' | 'amendment' | 'blog' | 'statement' | 'todo';

interface PolityLink {
  type: EntityType;
  id: string;
}

// Parse Polity URLs
function parsePolityUrl(url: string): PolityLink | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;

    // Match patterns like /user/123, /group/456, etc.
    const match = pathname.match(/^\/(user|group|event|amendment|blog|statement|todos?)\/([^/]+)/);
    if (match) {
      let type = match[1] as EntityType;
      // Normalize "todos" to "todo"
      if (type === ('todos' as any)) type = 'todo';
      const id = match[2];
      return { type, id };
    }
  } catch {
    return null;
  }
  return null;
}

// Check if URL is a Polity link
function isPolityLink(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return (
      urlObj.hostname === window.location.hostname ||
      url.startsWith('/user/') ||
      url.startsWith('/group/') ||
      url.startsWith('/event/') ||
      url.startsWith('/amendment/') ||
      url.startsWith('/blog/') ||
      url.startsWith('/statement/') ||
      url.startsWith('/todo/')
    );
  } catch {
    return false;
  }
}

export function LinkPreview({ url, className = '' }: LinkPreviewProps) {
  const { t } = useTranslation();
  const isPolity = isPolityLink(url);
  const polityLink = isPolity ? parsePolityUrl(url) : null;

  if (!polityLink) {
    // Generic external link preview
    return (
      <Link to={url} target="_blank" rel="noopener noreferrer">
        <Card className={`hover:bg-accent ${className}`}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{url}</p>
              <p className="text-xs text-muted-foreground">{t('components.linkPreview.externalLink')}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Polity-specific preview
  return <PolityLinkPreview type={polityLink.type} id={polityLink.id} className={className} />;
}

interface PolityLinkPreviewProps {
  type: EntityType;
  id: string;
  className?: string;
}

function PolityLinkPreview({ type, id, className }: PolityLinkPreviewProps) {
  switch (type) {
    case 'user':
      return <UserPreview userId={id} className={className} />;
    case 'group':
      return <GroupPreview groupId={id} className={className} />;
    case 'event':
      return <EventPreview eventId={id} className={className} />;
    case 'amendment':
      return <AmendmentPreview amendmentId={id} className={className} />;
    case 'blog':
      return <BlogPreview blogId={id} className={className} />;
    case 'statement':
      return <StatementPreview statementId={id} className={className} />;
    case 'todo':
      return <TodoPreview todoId={id} className={className} />;
    default:
      return null;
  }
}

function UserPreview({ userId, className }: { userId: string; className?: string }) {
  const { t } = useTranslation();
  const { user } = useUserState({ userId });

  if (!user) {
    return <PreviewSkeleton />;
  }

  return (
    <Link to={`/user/${userId}`}>
      <Card className={`border-l-4 border-l-blue-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <User className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback>{(user.first_name || user.handle)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || t('components.linkPreview.unknownUser')}</p>
            {user.handle && (
              <p className="truncate text-sm text-muted-foreground">@{user.handle}</p>
            )}
            {user.bio && (
              <p className="truncate text-xs text-muted-foreground">{user.bio}</p>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.user')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function GroupPreview({ groupId, className }: { groupId: string; className?: string }) {
  const { t } = useTranslation();
  const { group } = useGroupState({ groupId });

  if (!group) {
    return <PreviewSkeleton />;
  }

  return (
    <Link to={`/group/${groupId}`}>
      <Card className={`border-l-4 border-l-purple-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <Users className="h-5 w-5 flex-shrink-0 text-purple-500" />
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={undefined} />
            <AvatarFallback>{group.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{group.name}</p>
            {group.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{group.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{group.member_count || 0} {t('components.linkPreview.members')}</p>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.group')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventPreview({ eventId, className }: { eventId: string; className?: string }) {
  const { t } = useTranslation();
  const { event } = useEventState({ eventId });

  if (!event) {
    return <PreviewSkeleton />;
  }

  return (
    <Link to={`/event/${eventId}`}>
      <Card className={`border-l-4 border-l-green-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <Calendar className="h-5 w-5 flex-shrink-0 text-green-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{event.title}</p>
            {event.start_date && (
              <p className="text-xs text-muted-foreground">
                {new Date(event.start_date).toLocaleDateString()}
              </p>
            )}
            {event.location_name && (
              <p className="truncate text-xs text-muted-foreground">{event.location_name}</p>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.event')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function AmendmentPreview({ amendmentId, className }: { amendmentId: string; className?: string }) {
  const { t } = useTranslation();
  const { amendment } = useAmendmentState({ amendmentId });

  if (!amendment) {
    return <PreviewSkeleton />;
  }

  return (
    <Link to={`/amendment/${amendmentId}`}>
      <Card className={`border-l-4 border-l-orange-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-orange-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{amendment.title}</p>
            {amendment.reason && (
              <p className="truncate text-xs text-muted-foreground">{amendment.reason}</p>
            )}
            {amendment.status && (
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {amendment.status}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.amendment')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function BlogPreview({ blogId, className }: { blogId: string; className?: string }) {
  const { t } = useTranslation();
  const { blogWithBloggers } = useBlogState({ blogId, includeBloggers: true });
  const blog = blogWithBloggers;

  if (!blog) {
    return <PreviewSkeleton />;
  }

  const blogOwner = blog.bloggers?.find((b: any) => b.status === 'owner')?.user;
  const blogViewUrl = blog.group_id
    ? `/group/${blog.group_id}/blog/${blogId}`
    : `/user/${blogOwner?.id || ''}/blog/${blogId}`;

  return (
    <Link to={blogViewUrl}>
      <Card className={`border-l-4 border-l-pink-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <MessageSquare className="h-5 w-5 flex-shrink-0 text-pink-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{blog.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{blog.like_count || 0} {t('components.linkPreview.likes')}</span>
              <span>•</span>
              <span>{blog.comment_count || 0} {t('components.linkPreview.comments')}</span>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.blog')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatementPreview({ statementId, className }: { statementId: string; className?: string }) {
  const { t } = useTranslation();
  const { statement } = useStatementState({ id: statementId });

  if (!statement) {
    return <PreviewSkeleton />;
  }

  if (!statement) {
    return null;
  }

  return (
    <Link to={`/statement/${statementId}`}>
      <Card className={`border-l-4 border-l-cyan-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-cyan-500" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm">{statement.text}</p>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.statement')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function TodoPreview({ todoId, className }: { todoId: string; className?: string }) {
  const { t } = useTranslation();
  const { todo } = useTodoState({ todoId });

  if (!todo) {
    return <PreviewSkeleton />;
  }

  return (
    <Link to={`/todos/${todoId}`}>
      <Card className={`border-l-4 border-l-indigo-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <CheckSquare className="h-5 w-5 flex-shrink-0 text-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{todo.title}</p>
            {todo.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{todo.description}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {todo.status?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {todo.priority}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {t('components.linkPreview.todo')}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function PreviewSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted"></div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted"></div>
          <div className="h-3 w-1/2 rounded bg-muted"></div>
        </div>
      </CardContent>
    </Card>
  );
}
