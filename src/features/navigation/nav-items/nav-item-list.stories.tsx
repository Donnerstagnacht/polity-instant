import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavItemList } from './nav-item-list.tsx';
import { navItemsAuthenticated } from './nav-items-authenticated.tsx';
import { navItemsUnauthenticated } from './nav-items-unauthenticated.tsx';
import { fn } from 'storybook/test';
import type { NavigationView } from '@/features/navigation/types/navigation.types.tsx';

// Wrapper component to use the function
function AuthenticatedNavItemWrapper(args: Record<string, unknown>) {
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
      isMobile={args.isMobile as boolean ?? true}
      isPrimary={args.isPrimary as boolean ?? true}
      navigationView={(args.navigationView as string as NavigationView) || 'asButtonList'}
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
