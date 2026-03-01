import { useUserBlogsAndStatementsPage } from '@/features/users/hooks/useUserBlogsAndStatementsPage';
import { BlogsAndStatementsView } from '@/features/content/ui/BlogsAndStatementsView';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { toast } from 'sonner';

interface UserBlogsAndStatementsPageProps {
  userId: string;
}

export function UserBlogsAndStatementsPage({ userId }: UserBlogsAndStatementsPageProps) {
  const { t } = useTranslation();
  const {
    blogs,
    statements,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useUserBlogsAndStatementsPage({ userId });

  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;
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

  const getEditorUrl = (blogId: string) => `/user/${userId}/blog/${blogId}/editor`;

  return (
    <BlogsAndStatementsView
      blogs={blogs}
      statements={statements}
      filter={filter}
      setFilter={setFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      canManage={isOwnProfile}
      getEditorUrl={getEditorUrl}
      onDeleteBlog={handleDeleteBlog}
    />
  );
}
