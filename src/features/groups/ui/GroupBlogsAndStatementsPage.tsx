import { useGroupBlogsAndStatementsPage } from '@/features/groups/hooks/useGroupBlogsAndStatementsPage';
import { StatementCard } from '@/features/statements/ui/StatementCard';
import { GroupBlogCard } from './GroupBlogCard';
import { Input } from '@/features/shared/ui/ui/input';
import { Button } from '@/features/shared/ui/ui/button';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { usePermissions } from '@/zero/rbac';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { Link } from '@tanstack/react-router';
import { Search, BookOpen, MessageSquareText, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GroupBlogsAndStatementsPageProps {
  groupId: string;
}

export function GroupBlogsAndStatementsPage({ groupId }: GroupBlogsAndStatementsPageProps) {
  const { t } = useTranslation();
  const {
    blogs,
    statements,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useGroupBlogsAndStatementsPage({ groupId });

  const { can } = usePermissions({ groupId });
  const canManageBlogs = can('manage', 'blogs');
  const { deleteBlog } = useBlogActions();

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(t('features.blogs.detail.confirmDelete'))) return;
    try {
      await deleteBlog(blogId);
      toast.success(t('features.blogs.detail.blogDeleted'));
    } catch {
      toast.error(t('features.blogs.detail.blogDeleteFailed'));
    }
  };

  const filters: { value: typeof filter; label: string }[] = [
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
            {blogs.map((blog: any) => (
              <div key={blog.id} className="relative">
                <GroupBlogCard blog={blog} groupId={groupId} />
                {canManageBlogs && (
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Link to={`/group/${groupId}/blog/${blog.id}/editor`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteBlog(blog.id, blog.title);
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
          <div className="space-y-2">
            {statements.map((s: any) => (
              <StatementCard key={s.id} statement={s} />
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
