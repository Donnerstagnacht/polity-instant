import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Conversation } from '../types/message.types';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation?: Conversation;
}

export function GroupMembersDialog({
  open,
  onOpenChange,
  conversation,
}: GroupMembersDialogProps) {
  const { t } = useTranslation();
  const groupName = conversation?.name || conversation?.group?.name || t('features.messages.groupMembers.defaultGroupName');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('features.messages.groupMembers.title')}</DialogTitle>
          <DialogDescription>
            {t('features.messages.groupMembers.description', { groupName })}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] space-y-2 overflow-y-auto py-4">
          {conversation?.participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={participant.user?.avatar ?? undefined}
                />
                <AvatarFallback>
                  {participant.user?.first_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">
                  {[participant.user?.first_name, participant.user?.last_name].filter(Boolean).join(' ') || t('common.labels.unspecifiedUser')}
                </p>
                {participant.user?.handle && (
                  <p className="text-sm text-muted-foreground">
                    @{participant.user?.handle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
