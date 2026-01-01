import React from 'react';
import { BlogsCard } from '@/features/user/ui/BlogsCard';

interface BlogSearchCardProps {
  blog: any;
  gradientClass?: string;
}

export function BlogSearchCard({
  blog,
  gradientClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
}: BlogSearchCardProps) {
  // Calculate supporters from upvotes and downvotes
  const supporters = (blog.upvotes || 0) - (blog.downvotes || 0);
  const comments = blog.comments?.length || blog.commentCount || 0;

  return (
    <a href={`/blog/${blog.id}`} className="block cursor-pointer">
      <BlogsCard
        blog={{
          id: blog.id,
          title: blog.title,
          date: blog.date || new Date(blog.createdAt).toLocaleDateString(),
          supporters: supporters,
          comments: comments,
        }}
        gradientClass={gradientClass}
      />
    </a>
  );
}
