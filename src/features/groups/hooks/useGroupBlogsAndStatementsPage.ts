import { useState, useMemo } from 'react';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useStatementState } from '@/zero/statements/useStatementState';

type ContentFilter = 'all' | 'blogs' | 'statements';

interface UseGroupBlogsAndStatementsPageOptions {
  groupId: string;
}

export function useGroupBlogsAndStatementsPage({ groupId }: UseGroupBlogsAndStatementsPageOptions) {
  const { blogsByGroup } = useBlogState({ groupId });
  const { statementsByGroup } = useStatementState({ groupId });

  const [filter, setFilter] = useState<ContentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const blogs = useMemo(() => {
    const items = blogsByGroup ?? [];
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      b =>
        (b.title ?? '').toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q),
    );
  }, [blogsByGroup, searchQuery]);

  const statements = useMemo(() => {
    const items = statementsByGroup ?? [];
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(s => (s.text ?? '').toLowerCase().includes(q));
  }, [statementsByGroup, searchQuery]);

  return {
    blogs,
    statements,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  };
}
