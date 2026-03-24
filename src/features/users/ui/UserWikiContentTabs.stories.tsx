import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserWikiContentTabs } from './UserWikiContentTabs';
import type { UserProfile } from '../types/user.types';

const mockUser = {
  id: 'user-123',
  email: 'sarah@example.com',
  handle: 'sarahjohnson',
  first_name: 'Sarah',
  last_name: 'Johnson',
  bio: 'Constitutional Law Expert',
  about: 'Political scientist specializing in comparative constitutional design.',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  x: null,
  youtube: null,
  linkedin: null,
  website: null,
  location: 'Brussels, Belgium',
  visibility: 'public',
  subscriber_count: 0,
  amendment_count: 2,
  group_count: 2,
  tutorial_step: null,
  assistant_introduction: null,
  created_at: Date.now(),
  updated_at: Date.now(),
  statements: [],
  group_memberships: [],
  blogger_relations: [],
  user_hashtags: [],
  amendment_collaborations: [],
} as unknown as UserProfile;

const meta: Meta = {
  component: UserWikiContentTabs,
};

export default meta;

export const UserWikiContentTabsDefault: StoryObj = {
  render: (args) => {
    const [searchTerms, setSearchTerms] = React.useState({ blogs: '', groups: '', amendments: '' });
    const handleSearchChange = (tab: keyof typeof searchTerms, value: string) => {
      setSearchTerms((prev) => ({ ...prev, [tab]: value }));
    };
    return (
      <UserWikiContentTabs
        user={mockUser}
        authorName="Sarah Johnson"
        authorAvatar="https://i.pravatar.cc/150?u=sarah"
        searchTerms={searchTerms}
        handleSearchChange={handleSearchChange}
        {...args}
      />
    );
  },
};
