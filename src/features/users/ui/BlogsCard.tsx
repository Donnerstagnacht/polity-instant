import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/features/shared/ui/ui/card';

export interface BlogsCardProps {
  blog: {
    id: string;
    title: string;
    date: string;
    supporters?: number;
    likes?: number; // Legacy support
    comments?: number;
    commentCount?: number;
    group_id?: string | null;
    user_id?: string | null;
  };
  gradientClass: string;
}

export const BlogsCard: React.FC<BlogsCardProps> = ({ blog, gradientClass }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (blog.group_id) {
      navigate({ to: '/group/$id/blog/$entryId', params: { id: blog.group_id!, entryId: blog.id } });
    } else if (blog.user_id) {
      navigate({ to: '/user/$id/blog/$entryId', params: { id: blog.user_id!, entryId: blog.id } });
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`overflow-hidden ${gradientClass} flex h-full cursor-pointer flex-col transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
    >
      <CardHeader className="">
        <CardTitle>{blog.title}</CardTitle>
        <CardDescription>{blog.date}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between text-muted-foreground">
        <span className="flex items-center">
          <span className="text-orange-500">👍</span>
          <span className="ml-1">{blog.supporters} supporters</span>
        </span>
        <span className="flex items-center">
          <span>💬</span>
          <span className="ml-1">{blog.comments} comments</span>
        </span>
      </CardFooter>
    </Card>
  );
};
