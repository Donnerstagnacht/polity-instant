import React from 'react';
import { BlogsCard } from '@/features/users/ui/BlogsCard';
import { HashtagDisplay } from '@/features/shared/ui/ui/hashtag-display';
import { extractHashtags } from '@/zero/common/hashtagHelpers';

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
  const hashtags = extractHashtags(blog.blog_hashtags);

  // Compute context-aware blog URL
  const blogOwnerUserId = blog.bloggers?.find((b: any) => b.status === 'owner')?.user_id
    || blog.bloggers?.[0]?.user_id;
  const blogUrl = blog.group_id
    ? `/group/${blog.group_id}/blog/${blog.id}`
    : `/user/${blogOwnerUserId || blog.id}/blog/${blog.id}`;

  return (
    <a href={blogUrl} className="block cursor-pointer">
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
      {hashtags.length > 0 && (
        <div className="px-4 pb-3">
          <HashtagDisplay hashtags={hashtags} />
        </div>
      )}
    </a>
  );
}
