import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AmendmentListTab } from './AmendmentListTab';
import type { ProfileAmendmentCollaboration } from '../types/user.types';

const mockCollaborations = [
  {
    id: '1',
    amendment_id: 'a1',
    user_id: 'user-123',
    role: 'author',
    amendment: {
      id: 'a1',
      code: 'CON-27',
      title: 'Article 27 Reform Proposal',
      status: 'Under Review',
      supporters: 1243,
      tags: '["judicial","diversity","reform"]',
      group_id: 'g1',
      created_at: Date.now(),
      amendment_hashtags: [],
    },
  },
  {
    id: '2',
    amendment_id: 'a2',
    user_id: 'user-123',
    role: 'collaborator',
    amendment: {
      id: 'a2',
      code: 'ELC-14',
      title: 'Electoral System Amendment',
      status: 'Passed',
      supporters: 2789,
      tags: '["electoral","voting"]',
      group_id: 'g2',
      created_at: Date.now(),
      amendment_hashtags: [],
    },
  },
] as unknown as readonly ProfileAmendmentCollaboration[];

const meta: Meta = {
  component: AmendmentListTab,
};

export default meta;

type Story = StoryObj;

export const AmendmentListTabDefault: Story = {
  render: (args) => {
    const [searchValue, setSearchValue] = React.useState('');
    return (
      <AmendmentListTab
        collaborations={mockCollaborations}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        {...args}
      />
    );
  },
};
