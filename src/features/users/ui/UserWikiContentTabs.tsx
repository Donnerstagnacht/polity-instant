import React from 'react';
import { Tabs, TabsContent, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { ScrollableTabsList } from '@/features/shared/ui/ui/scrollable-tabs';
import { BlogListTab } from './BlogListTab';
import { GroupsListTab } from './GroupListTab';
import { AmendmentListTab } from './AmendmentListTab';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { UserProfile, TabSearchState } from '../types/user.types';

interface UserWikiContentTabsProps {
  user: UserProfile;
  authorName: string;
  authorAvatar: string;
  searchTerms: TabSearchState;
  handleSearchChange: (tab: keyof TabSearchState, value: string) => void;
}

export const UserWikiContentTabs: React.FC<UserWikiContentTabsProps> = ({
  user,
  authorName,
  authorAvatar,
  searchTerms,
  handleSearchChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <Tabs defaultValue="blogs">
        <ScrollableTabsList>
          <TabsTrigger value="blogs">{t('pages.user.blogs.title')}</TabsTrigger>
          <TabsTrigger value="groups">{t('pages.user.groups.title')}</TabsTrigger>
          <TabsTrigger value="amendments">{t('pages.user.amendments.title')}</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="blogs" className="mt-4">
          <BlogListTab
            bloggerRelations={user.blogger_relations ?? []}
            authorName={authorName}
            authorAvatar={authorAvatar}
            userId={user.id}
            searchValue={searchTerms.blogs}
            onSearchChange={(value: string) => handleSearchChange('blogs', value)}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <GroupsListTab
            memberships={user.group_memberships ?? []}
            searchValue={searchTerms.groups}
            onSearchChange={(value: string) => handleSearchChange('groups', value)}
          />
        </TabsContent>

        <TabsContent value="amendments" className="mt-4">
          <AmendmentListTab
            collaborations={user.amendment_collaborations ?? []}
            searchValue={searchTerms.amendments}
            onSearchChange={(value: string) => handleSearchChange('amendments', value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
