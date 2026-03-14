import React from 'react';
import { BlogsCard } from '@/features/users/ui/BlogsCard';
import { HashtagDisplay } from '@/features/shared/ui/ui/hashtag-display';
import { extractHashtags } from '@/zero/common/hashtagHelpers';

import { type SearchBlog } from '../types/search.types';

interface BlogSearchCardProps {
  blog: SearchBlog;
  gradientClass?: string;
}

export function BlogSearchCard({
  blog,
  gradientClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
}: BlogSearchCardProps) {
  // Calculate supporters from upvotes and downvotes
  const supporters = (blog.upvotes || 0) - (blog.downvotes || 0);
  const comments = blog.comment_count || 0;
  const hashtags = extractHashtags(blog.blog_hashtags);

  // Compute context-aware blog URL
  const blogOwnerUserId = blog.bloggers?.find(relation => relation.status === 'owner')?.user_id
    || blog.bloggers?.find(relation => Boolean(relation.user_id))?.user_id;
  const blogGroupId = blog.group_id;
  const blogUrl = blogGroupId
    ? `/group/${blogGroupId}/blog/${blog.id}`
    : blogOwnerUserId
      ? `/user/${blogOwnerUserId}/blog/${blog.id}`
      : `/blog/${blog.id}`;

  return (
    <a href={blogUrl} className="block cursor-pointer">
      <BlogsCard
        blog={{
          id: blog.id,
          title: blog.title ?? '',
          date: blog.date || new Date(blog.created_at).toLocaleDateString(),
          supporters: supporters,
          comments: comments,
          group_id: blogGroupId,
          user_id: blogOwnerUserId,
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
