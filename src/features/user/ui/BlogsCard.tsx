import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export interface BlogsCardProps {
  blog: {
    id: number;
    title: string;
    date: string;
    likes: number;
    comments: number;
  };
  gradientClass: string;
}

export const BlogsCard: React.FC<BlogsCardProps> = ({ blog, gradientClass }) => (
  <Card
    key={blog.id}
    className={`overflow-hidden ${gradientClass} flex h-full flex-col transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
  >
    <CardHeader className="">
      <CardTitle>{blog.title}</CardTitle>
      <CardDescription>{blog.date}</CardDescription>
    </CardHeader>
    <CardFooter className="mt-auto flex items-center justify-between text-muted-foreground">
      <span className="flex items-center">
        <span className="text-red-500">♥</span>
        <span className="ml-1">{blog.likes} likes</span>
      </span>
      <span className="flex items-center">
        <span>💬</span>
        <span className="ml-1">{blog.comments} comments</span>
      </span>
    </CardFooter>
  </Card>
);
