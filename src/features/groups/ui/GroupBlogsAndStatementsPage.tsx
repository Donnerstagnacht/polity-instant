import { useGroupBlogsAndStatementsPage } from '@/features/groups/hooks/useGroupBlogsAndStatementsPage';
import { BlogsAndStatementsView } from '@/features/content/ui/BlogsAndStatementsView';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { usePermissions } from '@/zero/rbac';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
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

  const getEditorUrl = (blogId: string) => `/group/${groupId}/blog/${blogId}/editor`;

  return (
    <BlogsAndStatementsView
      blogs={blogs as Parameters<typeof BlogsAndStatementsView>[0]['blogs']}
      statements={statements as Parameters<typeof BlogsAndStatementsView>[0]['statements']}
      filter={filter}
      setFilter={setFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      canManage={canManageBlogs}
      getEditorUrl={getEditorUrl}
      onDeleteBlog={handleDeleteBlog}
    />
  );
}
