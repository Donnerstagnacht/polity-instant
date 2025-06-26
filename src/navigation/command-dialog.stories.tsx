import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationCommandDialog } from './command-dialog';
import { useNavigation } from './state/useNavigation';
import { useAuthStore } from '@/global-state/auth.store';

const meta = {
  component: NavigationCommandDialog,
} satisfies Meta<typeof NavigationCommandDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  args: {
    primaryNavItems: [],
    secondaryNavItems: [],
  },
  render: args => {
    // Set auth state for the story
    useAuthStore.getState().login();
    // Use navigation store logic as in __root.tsx
    const { primaryNavItems, secondaryNavItems } = useNavigation();
    return (
      <NavigationCommandDialog
        {...args}
        primaryNavItems={primaryNavItems}
        secondaryNavItems={secondaryNavItems}
      />
    );
  },
};

export const UnAuthenticated: Story = {
  args: {
    primaryNavItems: [],
    secondaryNavItems: null,
  },
  render: args => {
    useAuthStore.getState().logout();
    const { primaryNavItems } = useNavigation();
    return (
      <NavigationCommandDialog
        {...args}
        primaryNavItems={primaryNavItems}
        secondaryNavItems={null}
      />
    );
  },
};
