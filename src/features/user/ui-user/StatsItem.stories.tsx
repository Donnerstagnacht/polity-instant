import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsItem } from './StatsItem';

const meta: Meta = {
  component: StatsItem,
};

export default meta;

type Story = StoryObj;

import { USER } from '../state/user.data';

export const StatsItemDefault: Story = {
  render: args => (
    <StatsItem
      label={USER.stats[0].label}
      value={USER.stats[0].value}
      unit={USER.stats[0].unit}
      {...args}
    />
  ),
};
