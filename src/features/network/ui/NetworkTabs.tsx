import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { NetworkTab } from '../types/network.types';

interface NetworkTabsProps {
  activeTab: NetworkTab;
  onTabChange: (tab: NetworkTab) => void;
  currentNetworkContent: React.ReactNode;
  manageNetworkContent: React.ReactNode;
}

export function NetworkTabs({
  activeTab,
  onTabChange,
  currentNetworkContent,
  manageNetworkContent,
}: NetworkTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs
      value={activeTab}
      onValueChange={value => onTabChange(value as NetworkTab)}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="current-network">
          {t('features.network.tabs.currentNetwork')}
        </TabsTrigger>
        <TabsTrigger value="manage-network">
          {t('features.network.tabs.manageNetwork')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current-network" className="space-y-6">
        {currentNetworkContent}
      </TabsContent>

      <TabsContent value="manage-network" className="space-y-6">
        {manageNetworkContent}
      </TabsContent>
    </Tabs>
  );
}
