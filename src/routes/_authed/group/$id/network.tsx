import { createFileRoute } from '@tanstack/react-router'
import { useNetworkPage } from '@/features/network/hooks/useNetworkPage'
import { NetworkTabs } from '@/features/network/ui/NetworkTabs'
import { CurrentNetworkTab } from '@/features/network/ui/CurrentNetworkTab'
import { ManageNetworkTab } from '@/features/network/ui/ManageNetworkTab'

export const Route = createFileRoute('/_authed/group/$id/network')({
  component: GroupNetworkPage,
})

function GroupNetworkPage() {
  const { id: groupId } = Route.useParams()
  const np = useNetworkPage(groupId)

  return (
    <div className="space-y-4">
      <NetworkTabs
        activeTab={np.activeTab}
        onTabChange={np.setActiveTab}
        currentNetworkContent={<CurrentNetworkTab groupId={groupId} />}
        manageNetworkContent={
          <ManageNetworkTab
            groupId={groupId}
            groupName={np.groupName}
            searchQuery={np.searchQuery}
            onSearchQueryChange={np.setSearchQuery}
            directionFilter={np.directionFilter}
            onDirectionFilterChange={np.setDirectionFilter}
            manageRightFilter={np.manageRightFilter}
            onToggleRightFilter={np.toggleManageRightFilter}
            incomingRequests={np.filteredIncoming}
            outgoingRequests={np.filteredOutgoing}
            filteredRelationships={np.filteredRelationships}
            allRelationships={np.allRelationships}
            onAcceptRequest={np.handleAcceptRequest}
            onRejectRequest={np.handleRejectRequest}
            onDeleteRelationship={np.handleDeleteRelationship}
          />
        }
      />
    </div>
  )
}
