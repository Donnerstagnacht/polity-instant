import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateSwitcher } from './state-switcher';

const meta: Meta = {
  component: StateSwitcher,
};

export default meta;

type Story = StoryObj;

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
