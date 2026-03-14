import { BlogTimelineCard } from '@/features/timeline/ui/cards/BlogTimelineCard';
import { StatementTimelineCard } from '@/features/timeline/ui/cards/StatementTimelineCard';
import { Input } from '@/features/shared/ui/ui/input';
import { Button } from '@/features/shared/ui/ui/button';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Link } from '@tanstack/react-router';
import { Search, BookOpen, MessageSquareText, Plus, Edit, Trash2 } from 'lucide-react';

type ContentFilter = 'all' | 'blogs' | 'statements';

interface BlogItem {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  comment_count?: number | null;
  group_id?: string | null;
  user_id?: string | null;
  date?: string | null;
  blog_hashtags?: readonly { hashtag?: { id: string; tag: string } | null }[];
}

interface StatementItem {
  id: string;
  text?: string | null;
  user?: { first_name?: string | null; last_name?: string | null; handle?: string | null; avatar?: string | null } | null;
  upvotes?: number | null;
  downvotes?: number | null;
  comment_count?: number | null;
  image_url?: string | null;
  video_url?: string | null;
  group_id?: string | null;
  statement_hashtags?: readonly { hashtag?: { id: string; tag: string } | null }[];
}

interface BlogsAndStatementsViewProps {
  blogs: BlogItem[];
  statements: StatementItem[];
  filter: ContentFilter;
  setFilter: (filter: ContentFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canManage: boolean;
  getEditorUrl: (blogId: string) => string;
  onDeleteBlog: (blogId: string, blogTitle: string) => void;
}

export function BlogsAndStatementsView({
  blogs,
  statements,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  canManage,
  getEditorUrl,
  onDeleteBlog,
}: BlogsAndStatementsViewProps) {
  const { t } = useTranslation();

  const filters: { value: ContentFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'blogs', label: 'Blogs' },
    { value: 'statements', label: t('features.statements.title') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t('navigation.secondary.group.blogsAndStatements')}
        </h1>
        <div className="flex gap-2">
          <Link to="/create/blog-entry">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Blog
            </Button>
          </Link>
          <Link to="/create/statement">
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Statement
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-1">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Blog section */}
      {filter !== 'statements' && blogs.length > 0 && (
        <div className="space-y-3">
          {filter === 'all' && (
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5" /> Blogs
            </h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {blogs.map((blog) => (
              <div key={blog.id} className="relative">
                <BlogTimelineCard
                  blog={{
                    id: blog.id,
                    title: blog.title ?? '',
                    excerpt: blog.description ?? undefined,
                    coverImageUrl: blog.image_url ?? undefined,
                    commentCount: blog.comment_count ?? undefined,
                    groupId: blog.group_id,
                    authorId: blog.user_id ?? undefined,
                    publishedAt: blog.date ?? undefined,
                    hashtags: (blog.blog_hashtags ?? []).map((bh) => bh.hashtag).filter((h): h is { id: string; tag: string } => !!h),
                  }}
                />
                {canManage && (
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Link to={getEditorUrl(blog.id)}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteBlog(blog.id, blog.title ?? '');
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statement section */}
      {filter !== 'blogs' && statements.length > 0 && (
        <div className="space-y-3">
          {filter === 'all' && (
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquareText className="h-5 w-5" /> {t('features.statements.title')}
            </h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {statements.map((s) => (
              <StatementTimelineCard
                key={s.id}
                statement={{
                  id: s.id,
                  content: s.text ?? '',
                  authorName: s.user
                    ? [s.user.first_name, s.user.last_name].filter(Boolean).join(' ') || s.user.handle || ''
                    : '',
                  authorAvatar: s.user?.avatar ?? undefined,
                  supportCount: s.upvotes ?? undefined,
                  opposeCount: s.downvotes ?? undefined,
                  commentCount: s.comment_count ?? undefined,
                  imageUrl: s.image_url ?? undefined,
                  videoUrl: s.video_url ?? undefined,
                  groupId: s.group_id ?? undefined,
                  hashtags: (s.statement_hashtags ?? []).map((sh) => sh.hashtag).filter((h): h is { id: string; tag: string } => !!h),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filter !== 'statements' && blogs.length === 0 && filter !== 'blogs' && statements.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No content yet.</p>
        </div>
      )}
    </div>
  );
}
