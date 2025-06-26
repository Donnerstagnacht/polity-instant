import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavUserAvatar } from './nav-user-avatar2';

const meta = {
  component: NavUserAvatar,
} satisfies Meta<typeof NavUserAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    navigationView: 'asButton',
    isMobile: true,
  },
};
