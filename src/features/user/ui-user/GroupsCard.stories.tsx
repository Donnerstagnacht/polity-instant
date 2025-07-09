import { USER } from '../state/user.data';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupsCard } from './GroupsCard';
import { getRoleBadgeColor } from '../utils/userWiki.utils';

const meta: Meta = {
  component: GroupsCard,
};

export default meta;

export const GroupsCardDefault: StoryObj = {
  render: args => {
    const group = USER.groups[0];
    const badge = getRoleBadgeColor(group.role);
    const badgeClasses = `${badge.bg} ${badge.text}`;
    return <GroupsCard group={group} badgeClasses={badgeClasses} {...args} />;
  },
};
