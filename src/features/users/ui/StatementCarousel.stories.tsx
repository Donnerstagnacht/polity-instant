import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatementCarousel } from './StatementCarousel';
import type { ProfileStatement } from '../types/user.types';

const mockStatements = [
  {
    id: 's1',
    user_id: 'user-123',
    group_id: null,
    text: "Constitutional courts should be more representative of society's diversity.",
    image_url: null,
    video_url: null,
    visibility: 'public',
    upvotes: 0,
    downvotes: 0,
    comment_count: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    group: null,
    support_votes: [],
    surveys: [],
    statement_hashtags: [{ id: 'sh1', hashtag: { id: 'h1', tag: 'Judiciary' } }],
  },
  {
    id: 's2',
    user_id: 'user-123',
    group_id: null,
    text: 'Digital democracy tools can increase citizen participation in policymaking.',
    image_url: null,
    video_url: null,
    visibility: 'public',
    upvotes: 0,
    downvotes: 0,
    comment_count: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    group: null,
    support_votes: [],
    surveys: [],
    statement_hashtags: [{ id: 'sh2', hashtag: { id: 'h2', tag: 'Participation' } }],
  },
] as unknown as readonly ProfileStatement[];

const meta: Meta = {
  component: StatementCarousel,
};

export default meta;

type Story = StoryObj;

export const StatementCarouselDefault: Story = {
  render: (args) => (
    <StatementCarousel
      statements={mockStatements}
      authorName="Sarah Johnson"
      authorTitle="Constitutional Law Expert"
      authorAvatar="https://i.pravatar.cc/150?u=sarah"
      {...args}
    />
  ),
};
