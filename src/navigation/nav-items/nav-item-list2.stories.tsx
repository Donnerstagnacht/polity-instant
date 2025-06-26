import type { Meta, StoryObj } from '@storybook/react-vite';

import { NavItemList } from './nav-item-list2';

const meta = {
  component: NavItemList,
} satisfies Meta<typeof NavItemList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    navigationItems: [
      {
        id: 'home',
        label: 'Home',
        icon: 'Home',
        onClick: () => console.log('Home clicked'),
      },
      {
        id: 'file',
        label: 'File',
        icon: 'File',
        onClick: () => console.log('File clicked'),
      },
    ],
    isMobile: true,
    isPrimary: true,
  },
};
