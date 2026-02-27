import { GroupNetworkFlow } from './GroupNetworkFlow';

interface CurrentNetworkTabProps {
  groupId: string;
}

export function CurrentNetworkTab({ groupId }: CurrentNetworkTabProps) {
  return <GroupNetworkFlow groupId={groupId} />;
}
