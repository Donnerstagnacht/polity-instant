import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationCommandDialog } from './command-dialog';
import { useNavigation } from './state/useNavigation';

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
