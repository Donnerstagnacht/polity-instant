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
      getTagColor={tag => {
        switch (tag) {
          case 'Judiciary':
            return { bg: 'bg-blue-100', text: 'text-blue-700' };
          case 'Participation':
            return { bg: 'bg-green-100', text: 'text-green-700' };
          case 'Structure':
            return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
          case 'Governance':
            return { bg: 'bg-purple-100', text: 'text-purple-700' };
          default:
            return { bg: 'bg-gray-100', text: 'text-gray-700' };
        }
      }}
      {...args}
    />
  ),
};
