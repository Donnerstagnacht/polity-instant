import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsBar } from './StatsBar';

const meta: Meta = {
  component: StatsBar,
};

export default meta;

type Story = StoryObj;

export const StatsBarDefault: Story = {
  render: args => <StatsBar stats={USER.stats} {...args} />,
};
