import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './theme-toggle';
import { useEffect } from 'react';
import { useArgs } from 'storybook/preview-api';
import { useThemeStore } from '@/global-state/theme.store';

const meta: Meta = {
  component: ThemeToggle,
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size of the toggle button',
      defaultValue: 'default',
    },
    theme: {
      control: 'select',
      options: ['system', 'light', 'dark'],
      description: 'Current theme',
      defaultValue: 'system',
    },
  },
};

export default meta;

type Story = StoryObj;

export const ThemeToggleDefault: Story = {
  render: function Render() {
    const [{ theme = 'system', size }, updateArgs] = useArgs();
    const storeTheme = useThemeStore(s => s.theme);
    const setTheme = useThemeStore(s => s.setTheme);
    const isMounted = useThemeStore(s => s.isMounted);
    const setMounted = useThemeStore(s => s.setMounted);
    setMounted(true);

    // Sync Storybook args → Zustand store (only when args change)
    useEffect(() => {
      if (storeTheme !== theme) {
        setTheme(theme);
      }
    }, [theme, isMounted]);

    // Sync Zustand store → Storybook args (only when Zustand changes)
    useEffect(() => {
      if (storeTheme !== theme) {
        updateArgs({ theme: storeTheme });
      }
    }, [storeTheme, isMounted]);

    return <ThemeToggle size={size} />;
  },
};
