import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogListTab } from './BlogListTab';
import { GroupsListTab } from './GroupListTab';
import { AmendmentListTab } from './AmendmentListTab';
import { useTranslation } from '@/hooks/use-translation';
import type { User, TabSearchState } from '../types/user.types';

interface UserWikiContentTabsProps {
  user: User;
  searchTerms: TabSearchState;
  handleSearchChange: (tab: keyof TabSearchState, value: string) => void;
  getBlogGradient: (blogId: number) => string;
  getRoleBadgeColor: (role: string) => { bg: string; text: string; badge: string };
}

export const UserWikiContentTabs: React.FC<UserWikiContentTabsProps> = ({
  user,
  searchTerms,
  handleSearchChange,
  getBlogGradient,
  getRoleBadgeColor,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <Tabs defaultValue="blogs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="groups">{t('pages.users.groups.title')}</TabsTrigger>
          <TabsTrigger value="amendments">Amendments</TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mt-4">
          <BlogListTab
            blogs={user.blogs}
            searchValue={searchTerms.blogs}
            onSearchChange={(value: string) => handleSearchChange('blogs', value)}
            getBlogGradient={getBlogGradient}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <GroupsListTab
            groups={user.groups}
            searchValue={searchTerms.groups}
            onSearchChange={(value: string) => handleSearchChange('groups', value)}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </TabsContent>

        <TabsContent value="amendments" className="mt-4">
          <AmendmentListTab
            amendments={user.amendments}
            searchValue={searchTerms.amendments}
            onSearchChange={(value: string) => handleSearchChange('amendments', value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
