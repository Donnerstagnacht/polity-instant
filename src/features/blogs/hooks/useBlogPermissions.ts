import { usePermissions } from '../../../../db/rbac/usePermissions';

export function useBlogPermissions(blogId: string) {
  const { can, isABlogger, isLoading } = usePermissions({ blogId });

  return {
    canEdit: can('update', 'blogs'),
    canDelete: can('delete', 'blogs'),
    canManageMembers: can('manage', 'blogBloggers'),
    isBlogger: isABlogger(),
    isLoading,
  };
}
