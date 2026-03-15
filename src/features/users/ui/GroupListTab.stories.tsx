import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupsListTab } from './GroupListTab';
import type { ProfileGroupMembership } from '../types/user.types';

const mockMemberships = [
  {
    id: 'gm1',
    group_id: 'g1',
    user_id: 'user-123',
    role: null,
    status: 'active',
    group: {
      id: 'g1',
      name: 'Constitutional Reform Network',
      description: 'Working to modernize constitutional frameworks across Europe',
      image_url: null,
      member_count: 1243,
      event_count: 12,
      amendment_count: 8,
      group_hashtags: [
        { id: 'gh1', hashtag: { id: 'h1', tag: 'constitution' } },
        { id: 'gh2', hashtag: { id: 'h2', tag: 'reform' } },
      ],
    },
  },
  {
    id: 'gm2',
    group_id: 'g2',
    user_id: 'user-123',
    role: null,
    status: 'active',
    group: {
      id: 'g2',
      name: 'Democracy Innovations Lab',
      description: 'Researching new forms of democratic participation',
      image_url: null,
      member_count: 567,
      event_count: 5,
      amendment_count: 3,
      group_hashtags: [],
    },
  },
] as unknown as readonly ProfileGroupMembership[];

const meta: Meta = {
  component: GroupsListTab,
};

export default meta;

type Story = StoryObj;

export const GroupsListTabDefault: Story = {
  render: (args) => {
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <GroupsListTab
        memberships={mockMemberships}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        {...args}
      />
    );
  },
};
