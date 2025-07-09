import React from 'react';
import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserWikiContentTabs } from './UserWikiContentTabs';
import { getBlogGradient, getRoleBadgeColor, getStatusStyles } from '../utils/userWiki.utils';
import { GRADIENTS } from '../state/gradientColors';

const meta: Meta = {
  component: UserWikiContentTabs,
};

export default meta;

export const UserWikiContentTabsDefault: StoryObj = {
  render: args => {
    const user = USER;
    const [searchTerms, setSearchTerms] = React.useState({ blogs: '', groups: '', amendments: '' });
    const handleSearchChange = (tab: keyof typeof searchTerms, value: string) => {
      setSearchTerms(prev => ({ ...prev, [tab]: value }));
    };
    return (
      <UserWikiContentTabs
        user={user}
        searchTerms={searchTerms}
        handleSearchChange={handleSearchChange}
        getBlogGradient={(id: number) => getBlogGradient(id, GRADIENTS)}
        getRoleBadgeColor={getRoleBadgeColor}
        getStatusStyles={getStatusStyles}
        {...args}
      />
    );
  },
};
