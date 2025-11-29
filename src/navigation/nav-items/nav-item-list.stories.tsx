import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavItemList } from './nav-item-list';
import { navItemsAuthenticated } from './nav-items-authenticated';
import { navItemsUnauthenticated } from './nav-items-unauthenticated';
import { fn } from 'storybook/test';

// Wrapper component to use the function
function AuthenticatedNavItemWrapper(args: any) {
  const router = {
    navigate: fn(() => {
      // Mock navigation for Storybook
    }),
    push: fn(() => {
      // Mock push for Storybook
    }),
  } as any;

  const { primaryNavItems } = navItemsAuthenticated(router);

  return (
    <NavItemList
      {...args}
      navigationItems={primaryNavItems}
      navigationView={args.navigationView || 'asButtonList'}
    />
  );
}

const meta = {
  component: NavItemList,
} satisfies Meta<typeof NavItemList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  render: args => <AuthenticatedNavItemWrapper {...args} />,
  args: {
    navigationItems: [],
    isMobile: true,
    isPrimary: true,
    navigationView: 'asButtonList',
  },
};

export const UnAuthenticated: Story = {
  args: {
    navigationItems: navItemsUnauthenticated,
    isMobile: true,
    isPrimary: true,
    navigationView: 'asButtonList',
  },
};
