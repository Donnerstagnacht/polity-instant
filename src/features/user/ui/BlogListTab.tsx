import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { BlogTimelineCard } from '@/features/timeline/ui/cards/BlogTimelineCard';
import { useTranslation } from '@/hooks/use-translation';

interface BlogListTabProps {
  blogs: {
    id: number;
    title: string;
    date: string;
    description?: string;
    imageURL?: string;
    commentCount?: number;
    hashtags?: { id: string; tag: string }[];
    authorName?: string;
    authorAvatar?: string;
  }[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const BlogListTab: React.FC<BlogListTabProps> = ({ blogs, searchValue, onSearchChange }) => {
  const { t } = useTranslation();
  const filteredBlogs = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return blogs;
    return blogs.filter(
      blog => blog.title.toLowerCase().includes(term) || blog.date.toLowerCase().includes(term)
    );
  }, [blogs, searchValue]);

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('pages.user.blogs.searchPlaceholder')}
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredBlogs.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t('pages.user.blogs.noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map(blog => {
            return (
              <BlogTimelineCard
                key={blog.id}
                blog={{
                  id: String(blog.id),
                  title: blog.title,
                  excerpt: blog.description,
                  coverImageUrl: blog.imageURL,
                  commentCount: blog.commentCount ?? blog.comments,
                  hashtags: blog.hashtags,
                  authorName: blog.authorName ?? t('common.unknownUser'),
                  authorAvatar: blog.authorAvatar,
                  publishedAt: blog.date,
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
