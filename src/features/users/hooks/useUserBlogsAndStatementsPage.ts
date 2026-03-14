import { useState, useMemo } from 'react';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useStatementState } from '@/zero/statements/useStatementState';

type ContentFilter = 'all' | 'blogs' | 'statements';

interface UseUserBlogsAndStatementsPageOptions {
  userId: string;
}

export function useUserBlogsAndStatementsPage({ userId }: UseUserBlogsAndStatementsPageOptions) {
  const { bloggersByUser } = useBlogState({ userId });
  const { statementsByUser } = useStatementState({ userId });

  const [filter, setFilter] = useState<ContentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize bloggersByUser (blog_blogger junction rows) into blog objects
  // Filter to only personal blogs (no group_id) since group blogs appear on group pages
  const blogs = useMemo(() => {
    const items = (bloggersByUser ?? [])
      .map((row) => row.blog ? { ...row.blog, user_id: userId } : null)
      .filter((blog) => blog && !blog.group_id);
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (b) =>
        (b?.title ?? '').toLowerCase().includes(q) ||
        (b?.description ?? '').toLowerCase().includes(q),
    );
  }, [bloggersByUser, searchQuery]);

  const statements = useMemo(() => {
    const items = statementsByUser ?? [];
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((s) => (s.text ?? '').toLowerCase().includes(q));
  }, [statementsByUser, searchQuery]);

  return {
    blogs,
    statements,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  };
}
