import type { Meta, StoryObj } from '@storybook/react-vite';
import { DynamicNavigation } from './dynamic-navigation';
import type {
  NavigationView,
  NavigationType,
  ScreenType,
} from '@/navigation/types/navigation.types';
import { useEffect } from 'react';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';

const meta: Meta<typeof DynamicNavigation> = {
  title: 'Navigation/DynamicNavigation',
  component: DynamicNavigation,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DynamicNavigation>;

const NavigationStory = (args: any) => {
  const setNavigationType = useNavigationStore(state => state.setNavigationType);
  const setNavigationView = useNavigationStore(state => state.setNavigationView);

  // Create router and nav items inside the component
  const mockRouter = {
    navigate: () => {
      console.log('Navigating...');
    },
  } as any;
  const { primaryNavItems } = navItemsAuthenticated(mockRouter);

  useEffect(() => {
    setNavigationType(args.navigationType);
    setNavigationView(args.navigationView);
  }, [args.navigationType, args.navigationView, setNavigationType, setNavigationView]);

  return (
    <DynamicNavigation
      {...args}
      navigationView={args.navigationView}
      navigationItems={primaryNavItems}
    />
  );
};

export const AsButtonPrimaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButton' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asButton - primary - desktop',
};

export const AsButtonPrimaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButton' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asButton - primary - mobile',
};

export const AsButtonSecondaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButton' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asButton - secondary - desktop',
};

export const AsButtonSecondaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButton' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asButton - secondary - mobile',
};

export const AsButtonListPrimaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButtonList' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asButtonList - primary - desktop',
};

export const AsButtonListPrimaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButtonList' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asButtonList - primary - mobile',
};

export const AsButtonListSecondaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButtonList' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asButtonList - secondary - desktop',
};

export const AsButtonListSecondaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asButtonList' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asButtonList - secondary - mobile',
};

export const AsLabeledButtonListPrimaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asLabeledButtonList' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asLabeledButtonList - primary - desktop',
};

export const AsLabeledButtonListPrimaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asLabeledButtonList' as NavigationView,
    navigationType: 'primary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asLabeledButtonList - primary - mobile',
};

export const AsLabeledButtonListSecondaryDesktop: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asLabeledButtonList' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'desktop' as ScreenType,
  },
  name: 'asLabeledButtonList - secondary - desktop',
};

export const AsLabeledButtonListSecondaryMobile: Story = {
  render: NavigationStory,
  args: {
    navigationView: 'asLabeledButtonList' as NavigationView,
    navigationType: 'secondary' as NavigationType,
    screenType: 'mobile' as ScreenType,
  },
  name: 'asLabeledButtonList - secondary - mobile',
};
