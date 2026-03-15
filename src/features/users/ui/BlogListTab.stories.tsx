import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlogListTab } from './BlogListTab';
import type { ProfileBloggerRelation } from '../types/user.types';

const mockBloggerRelations = [
  {
    id: '1',
    blog_id: 'b1',
    user_id: 'user-123',
    blog: {
      id: 'b1',
      title: 'Reimagining Parliamentary Oversight',
      description: 'An analysis of modern oversight mechanisms.',
      image_url: null,
      comment_count: 47,
      group_id: null,
      date: Date.now(),
      blog_hashtags: [],
    },
  },
  {
    id: '2',
    blog_id: 'b2',
    user_id: 'user-123',
    blog: {
      id: 'b2',
      title: "The Case for Citizens' Assemblies",
      description: 'Why citizen assemblies work.',
      image_url: null,
      comment_count: 83,
      group_id: null,
      date: Date.now(),
      blog_hashtags: [],
    },
  },
] as unknown as readonly ProfileBloggerRelation[];

const meta: Meta = {
  component: BlogListTab,
};

export default meta;

type Story = StoryObj;

export const BlogListTabDefault: Story = {
  render: (args) => {
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <BlogListTab
        bloggerRelations={mockBloggerRelations}
        authorName="Sarah Johnson"
        authorAvatar="https://i.pravatar.cc/150?u=sarah"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        {...args}
      />
    );
  },
};
