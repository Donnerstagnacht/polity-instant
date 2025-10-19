import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { BlogsCard } from './BlogsCard';

interface BlogListTabProps {
  blogs: {
    id: number;
    title: string;
    date: string;
    likes: number;
    comments: number;
  }[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  getBlogGradient: (id: number) => string;
}

import { useMemo } from 'react';

export const BlogListTab: React.FC<BlogListTabProps> = ({
  blogs,
  searchValue,
  onSearchChange,
  getBlogGradient,
}) => {
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
          placeholder="Search blogs..."
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredBlogs.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No blogs found matching your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map(blog => {
            const gradientClass = getBlogGradient(blog.id);
            return <BlogsCard key={blog.id} blog={blog} gradientClass={gradientClass} />;
          })}
        </div>
      )}
    </>
  );
};
