'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  FileText,
  User,
  MessageSquare,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '../../../db';

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
  const isPolity = isPolityLink(url);
  const polityLink = isPolity ? parsePolityUrl(url) : null;

  if (!polityLink) {
    // Generic external link preview
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <Card className={`hover:bg-accent ${className}`}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{url}</p>
              <p className="text-xs text-muted-foreground">External Link</p>
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
  const { data, isLoading } = db.useQuery({
    $users: {
      $: {
        where: {
          id: userId,
        },
      },
    },
  });

  const user = data?.$users?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <Link href={`/user/${userId}`}>
      <Card className={`border-l-4 border-l-blue-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <User className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatar || user.imageURL} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.name || 'Unknown User'}</p>
            {user.handle && (
              <p className="truncate text-sm text-muted-foreground">@{user.handle}</p>
            )}
            {user.subtitle && (
              <p className="truncate text-xs text-muted-foreground">{user.subtitle}</p>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            User
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function GroupPreview({ groupId, className }: { groupId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    groups: {
      $: {
        where: {
          id: groupId,
        },
      },
    },
  });

  const group = data?.groups?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!group) {
    return null;
  }

  return (
    <Link href={`/group/${groupId}`}>
      <Card className={`border-l-4 border-l-purple-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <Users className="h-5 w-5 flex-shrink-0 text-purple-500" />
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={group.imageURL} />
            <AvatarFallback>{group.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{group.name}</p>
            {group.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{group.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{group.memberCount || 0} members</p>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Group
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventPreview({ eventId, className }: { eventId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
    },
  });

  const event = data?.events?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!event) {
    return null;
  }

  return (
    <Link href={`/event/${eventId}`}>
      <Card className={`border-l-4 border-l-green-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <Calendar className="h-5 w-5 flex-shrink-0 text-green-500" />
          {event.imageURL && (
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={event.imageURL} />
              <AvatarFallback>{event.title?.[0]?.toUpperCase() || 'E'}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{event.title}</p>
            {event.startDate && (
              <p className="text-xs text-muted-foreground">
                {new Date(event.startDate).toLocaleDateString()}
              </p>
            )}
            {event.location && (
              <p className="truncate text-xs text-muted-foreground">{event.location}</p>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Event
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function AmendmentPreview({ amendmentId, className }: { amendmentId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
    },
  });

  const amendment = data?.amendments?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!amendment) {
    return null;
  }

  return (
    <Link href={`/amendment/${amendmentId}`}>
      <Card className={`border-l-4 border-l-orange-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-orange-500" />
          {amendment.imageURL && (
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={amendment.imageURL} />
              <AvatarFallback>{amendment.title?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{amendment.title}</p>
            {amendment.subtitle && (
              <p className="truncate text-xs text-muted-foreground">{amendment.subtitle}</p>
            )}
            {amendment.status && (
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {amendment.status}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Amendment
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function BlogPreview({ blogId, className }: { blogId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    blogs: {
      $: {
        where: {
          id: blogId,
        },
      },
    },
  });

  const blog = data?.blogs?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!blog) {
    return null;
  }

  return (
    <Link href={`/blog/${blogId}`}>
      <Card className={`border-l-4 border-l-pink-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <MessageSquare className="h-5 w-5 flex-shrink-0 text-pink-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{blog.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{blog.likeCount || 0} likes</span>
              <span>•</span>
              <span>{blog.commentCount || 0} comments</span>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Blog
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatementPreview({ statementId, className }: { statementId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    statements: {
      $: {
        where: {
          id: statementId,
        },
      },
    },
  });

  const statement = data?.statements?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!statement) {
    return null;
  }

  return (
    <Link href={`/statement/${statementId}`}>
      <Card className={`border-l-4 border-l-cyan-500 hover:bg-accent ${className}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-cyan-500" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm">{statement.text}</p>
            {statement.tag && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {statement.tag}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Statement
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function TodoPreview({ todoId, className }: { todoId: string; className?: string }) {
  const { data, isLoading } = db.useQuery({
    todos: {
      $: {
        where: {
          id: todoId,
        },
      },
    },
  });

  const todo = data?.todos?.[0];

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!todo) {
    return null;
  }

  return (
    <Link href={`/todos/${todoId}`}>
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
            Todo
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
