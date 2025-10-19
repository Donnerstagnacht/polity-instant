import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlogsCard } from './BlogsCard';
import { getBlogGradient } from '../utils/userWiki.utils';
import { GRADIENTS } from '../state/gradientColors';

const meta: Meta = {
  component: BlogsCard,
};

export default meta;

export const BlogsCardDefault: StoryObj = {
  render: args => {
    const blog = USER.blogs[0];
    const gradientClass = getBlogGradient(blog.id, GRADIENTS);
    return <BlogsCard blog={blog} gradientClass={gradientClass} {...args} />;
  },
};
