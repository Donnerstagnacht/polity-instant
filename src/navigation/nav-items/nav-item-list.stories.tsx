import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavItemList } from './nav-item-list';
import { navItemsAuthenticated } from './nav-items-authenticated';
import { navItemsUnauthenticated } from './nav-items-unauthenticated';
import { fn } from 'storybook/test';

const meta = {
  component: NavItemList,
} satisfies Meta<typeof NavItemList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  render: args => {
    const router = {
      navigate: fn(() => {
        console.log('Navigate called');
      }),
    } as any;
    const { primaryNavItems } = navItemsAuthenticated(router);
    return <NavItemList {...args} navigationItems={primaryNavItems} />;
  },
  args: {
    navigationItems: [],
    isMobile: true,
    isPrimary: true,
  },
};

export const UnAuthenticated: Story = {
  args: {
    navigationItems: navItemsUnauthenticated,
    isMobile: true,
    isPrimary: true,
  },
};
