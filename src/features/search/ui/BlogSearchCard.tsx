import React from 'react';
import { useRouter } from 'next/navigation';
import { BlogsCard } from '@/features/user/ui/BlogsCard';

interface BlogSearchCardProps {
  blog: any;
  gradientClass?: string;
}

export function BlogSearchCard({
  blog,
  gradientClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
}: BlogSearchCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/blog/${blog.id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <BlogsCard
        blog={{
          id: blog.id,
          title: blog.title,
          date: blog.date || new Date(blog.createdAt).toLocaleDateString(),
          likes: blog.likes || 0,
          comments: blog.comments || 0,
        }}
        gradientClass={gradientClass}
      />
    </div>
  );
}
