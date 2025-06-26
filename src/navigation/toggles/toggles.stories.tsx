import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './theme-toggle';
import { StateToggle } from './state-toggle';
import { StateSwitcher } from './state-switcher';
import { LanguageToggle } from './language-toggle';
import { useState } from 'react';
import type { NavigationView, Size } from '@/navigation/types/navigation.types';

const meta: Meta = {
  title: 'Navigation/Toggles',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const ThemeToggleDefault: Story = {
  render: args => <ThemeToggle {...args} />,
  args: {
    size: 'default' as Size,
  },
  name: 'ThemeToggle - default',
  parameters: {
    docs: {
      autodocs: true,
      description: {
        story:
          'This component uses a global theme store and therefore the button clicks do not work in storybook.',
      },
    },
  },
};

export const StateToggleDefault: Story = {
  render: args => {
    const [state, setState] = useState<NavigationView>('asButton');
    return <StateToggle currentState={state} onStateChange={setState} {...args} />;
  },
  args: {
    size: 'default' as Size,
  },
  name: 'StateToggle - default',
  parameters: { docs: { autodocs: true } },
};

export const StateSwitcherPrimaryDesktop: Story = {
  render: () => <StateSwitcher isMobile={false} navigationType={'primary'} />,
  name: 'StateSwitcher - primary - desktop',
  parameters: { docs: { autodocs: true } },
};

export const StateSwitcherPrimaryMobile: Story = {
  render: () => <StateSwitcher isMobile={true} navigationType={'primary'} />,
  name: 'StateSwitcher - primary - mobile',
  parameters: { docs: { autodocs: true } },
};

export const LanguageToggleDefault: Story = {
  render: args => <LanguageToggle {...args} />,
  args: {
    size: 'default' as Size,
    variant: 'popover',
  },
  name: 'LanguageToggle - default',
  parameters: { docs: { autodocs: true } },
};
