import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlogListTab } from './BlogListTab';
import { getBlogGradient } from '../utils/userWiki.utils';
import { GRADIENTS } from '../state/gradientColors';

const meta: Meta = {
  component: BlogListTab,
};

export default meta;

type Story = StoryObj;

export const BlogListTabDefault: Story = {
  render: args => {
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <BlogListTab
        blogs={USER.blogs}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        getBlogGradient={(id: number) => getBlogGradient(id, GRADIENTS)}
        {...args}
      />
    );
  },
};
