import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareButton } from './ShareButton';

const meta: Meta<typeof ShareButton> = {
  component: ShareButton,
  title: 'Components/Shared/ShareButton',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShareButton>;

export const Default: Story = {
  args: {
    url: '/amendment/123',
    title: 'Sample Amendment Title',
    description: 'This is a sample amendment description that will be shared.',
    variant: 'outline',
    size: 'default',
  },
};

export const Small: Story = {
  args: {
    url: '/event/456',
    title: 'Community Meeting',
    description: 'Join us for our monthly community meeting.',
    variant: 'outline',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    url: '/blog/789',
    title: 'Important Blog Post',
    description: 'Read our latest insights and updates.',
    variant: 'outline',
    size: 'lg',
  },
};

export const DefaultVariant: Story = {
  args: {
    url: '/group/101',
    title: 'Community Group',
    description: 'Join our active community group.',
    variant: 'default',
    size: 'default',
  },
};

export const GhostVariant: Story = {
  args: {
    url: '/user/202',
    title: 'User',
    description: 'Check out this user.',
    variant: 'ghost',
    size: 'default',
  },
};
