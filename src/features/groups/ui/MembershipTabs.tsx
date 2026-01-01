/**
 * Membership Tabs Component
 *
 * Tabs for navigating between memberships and roles management.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MembershipTab } from '../types/group.types';

interface MembershipTabsProps {
  activeTab: MembershipTab;
  onTabChange: (tab: MembershipTab) => void;
  membershipsContent: React.ReactNode;
  rolesContent: React.ReactNode;
  positionsContent?: React.ReactNode;
}

export function MembershipTabs({
  activeTab,
  onTabChange,
  membershipsContent,
  rolesContent,
  positionsContent,
}: MembershipTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={value => onTabChange(value as MembershipTab)}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="memberships">Memberships</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
      </TabsList>

      <TabsContent value="memberships" className="space-y-6">
        {membershipsContent}
      </TabsContent>

      <TabsContent value="roles" className="space-y-6">
        {rolesContent}
      </TabsContent>

      <TabsContent value="positions" className="space-y-6">
        {positionsContent}
      </TabsContent>
    </Tabs>
  );
}
