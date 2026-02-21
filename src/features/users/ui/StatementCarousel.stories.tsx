import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatementCarousel } from './StatementCarousel';

const meta: Meta = {
  component: StatementCarousel,
};

export default meta;

type Story = StoryObj;

export const StatementCarouselDefault: Story = {
  render: args => (
    <StatementCarousel
      statements={USER.statements}
      authorName={USER.name}
      authorTitle={USER.subtitle}
      authorAvatar={USER.avatar}
      {...args}
    />
  ),
};
