'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { UserSelectCard } from '@/components/ui/user-select-card';
import { GroupSelectCard } from '@/components/ui/entity-select-cards';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, tx, id } from 'db/db';
import { DEFAULT_GROUP_ROLES, DEFAULT_EVENT_ROLES } from 'db/rbac/constants';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useUserSearch } from '@/features/groups/hooks/useGroupData';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { UserPlus, X, Link as LinkIcon, Calendar, Check, Users } from 'lucide-react';
import { VisibilitySelector } from '@/components/ui/visibility-selector';
import { cn } from '@/utils/utils';
import { notifyRelationshipRequested } from '@/utils/notification-helpers';
import { useTranslation } from '@/hooks/use-translation';

type WithRight =
  | 'informationRight'
  | 'amendmentRight'
  | 'rightToSpeak'
  | 'activeVotingRight'
  | 'passiveVotingRight';

interface GroupLink {
  groupId: string;
  groupName: string;
  relationshipType: 'isParent' | 'isChild';
  rights: WithRight[];
}

export default function CreateGroupPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    hashtags: [] as string[],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
    invitedUserIds: [] as string[],
    groupLinks: [] as GroupLink[],
    createConstitutionalEvent: false,
    eventName: '',
    eventLocation: '',
    eventStartDate: new Date().toISOString().split('T')[0],
    eventStartTime: '09:00',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAllInvitedInSummary, setShowAllInvitedInSummary] = useState(false);

  // Step 2: Invite Members
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [lastInvitedUserId, setLastInvitedUserId] = useState<string | null>(null);
  const { users: allSearchedUsers = [], isLoading: isLoadingUsers } = useUserSearch(userSearchQuery, []);
  
  // Filter out the logged-in user from search results
  const searchedUsers = allSearchedUsers.filter((u: any) => u.id !== user?.id);

  // Step 4: Link Groups
  const [selectedLinkGroupId, setSelectedLinkGroupId] = useState('');
  const [linkRelationshipType, setLinkRelationshipType] = useState<'isParent' | 'isChild'>('isParent');
  const [selectedRights, setSelectedRights] = useState<Set<WithRight>>(new Set());

  // Fetch all groups for linking
  const { data: groupsData } = db.useQuery({
    groups: {},
  });
  const availableGroups = groupsData?.groups || [];

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Handler: Add invited user
  const handleAddUser = (userId: string) => {
    if (!userId) return;
    const user = searchedUsers.find((u: any) => u.id === userId);
    if (!user) return;
    
    if (formData.invitedUserIds.includes(userId)) {
      toast.info(t('pages.create.group.userAlreadyInvited'));
      setSelectedUserId('');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      invitedUserIds: [...prev.invitedUserIds, userId],
    }));
    setLastInvitedUserId(userId);
    setSelectedUserId('');
    setUserSearchQuery('');
  };

  // Auto-add user when selected
  useEffect(() => {
    if (selectedUserId) {
      handleAddUser(selectedUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const handleRemoveUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      invitedUserIds: prev.invitedUserIds.filter(id => id !== userId),
    }));
  };

  // Handler: Add group link
  const handleAddGroupLink = () => {
    if (!selectedLinkGroupId || selectedRights.size === 0) {
      toast.error(t('pages.create.group.selectGroupAndRights'));
      return;
    }

    const group = availableGroups.find((g: any) => g.id === selectedLinkGroupId);
    if (!group) return;

    const existingLink = formData.groupLinks.find(link => link.groupId === selectedLinkGroupId);
    if (existingLink) {
      toast.info(t('pages.create.group.groupAlreadyLinked'));
      setFormData(prev => ({
        ...prev,
        groupLinks: prev.groupLinks.map(link =>
          link.groupId === selectedLinkGroupId
            ? { ...link, rights: Array.from(selectedRights), relationshipType: linkRelationshipType }
            : link
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        groupLinks: [
          ...prev.groupLinks,
          {
            groupId: selectedLinkGroupId,
            groupName: group.name,
            relationshipType: linkRelationshipType,
            rights: Array.from(selectedRights),
          },
        ],
      }));
    }

    setSelectedLinkGroupId('');
    setSelectedRights(new Set());
  };

  const handleRemoveGroupLink = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groupLinks: prev.groupLinks.filter(link => link.groupId !== groupId),
    }));
  };

  const toggleRight = (right: WithRight) => {
    const newRights = new Set(selectedRights);
    if (newRights.has(right)) {
      newRights.delete(right);
    } else {
      newRights.add(right);
    }
    setSelectedRights(newRights);
  };

  const RIGHTS: { value: WithRight; label: string }[] = [
    { value: 'informationRight', label: 'Information Right' },
    { value: 'amendmentRight', label: 'Amendment Right' },
    { value: 'rightToSpeak', label: 'Right to Speak' },
    { value: 'activeVotingRight', label: 'Active Voting Right' },
    { value: 'passiveVotingRight', label: 'Passive Voting Right' },
  ];

  // Get invited users data sorted alphabetically
  const invitedUsers = formData.invitedUserIds
    .map(userId => searchedUsers.find((u: any) => u.id === userId))
    .filter(Boolean)
    .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

  const lastInvitedUser = lastInvitedUserId
    ? searchedUsers.find((u: any) => u.id === lastInvitedUserId)
    : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error(t('pages.create.validation.loginRequired'));
        setIsSubmitting(false);
        return;
      }

      const groupId = id();
      const membershipId = id();
      const boardMemberRoleId = id();
      const memberRoleId = id();
      const conversationId = id();
      const conversationParticipantId = id();

      // Get role templates
      const adminTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Admin');
      const memberTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Member');

      const transactions = [
        // Create the group
        tx.groups[groupId].update({
          name: formData.name,
          description: formData.description || '',
          isPublic: formData.isPublic,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: formData.visibility,
        }),
        tx.groups[groupId].link({ owner: user.id }),

        // Create group conversation
        tx.conversations[conversationId]
          .update({
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            type: 'group',
            name: formData.name,
            status: 'accepted',
          })
          .link({ group: groupId, requestedBy: user.id }),

        // Add creator as first conversation participant
        tx.conversationParticipants[conversationParticipantId].update({
          joinedAt: new Date().toISOString(),
        }),
        tx.conversationParticipants[conversationParticipantId].link({
          conversation: conversationId,
          user: user.id,
        }),

        // Create Board Member role based on Admin template
        tx.roles[boardMemberRoleId].update({
          name: 'Board Member',
          description: adminTemplate?.description || 'Board member with administrative access',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[boardMemberRoleId].link({ group: groupId }),

        // Create Member role based on Member template
        tx.roles[memberRoleId].update({
          name: 'Member',
          description: memberTemplate?.description || 'Regular group member',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[memberRoleId].link({ group: groupId }),

        // Create membership for creator as Board Member
        tx.groupMemberships[membershipId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: user.id,
          role: boardMemberRoleId,
        }),
      ];

      // Add permissions/action rights for the Board Member role
      if (adminTemplate) {
        adminTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: boardMemberRoleId, group: groupId })
          );
        });
      }

      // Add permissions/action rights for the Member role
      if (memberTemplate) {
        memberTemplate.permissions.forEach(perm => {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: memberRoleId, group: groupId })
          );
        });
      }

      // Add hashtags
      formData.hashtags.forEach(tag => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ group: groupId })
        );
      });

      // Invite members
      formData.invitedUserIds.forEach(userId => {
        const inviteMembershipId = id();
        transactions.push(
          tx.groupMemberships[inviteMembershipId].update({
            status: 'invited',
            createdAt: new Date(),
          }),
          tx.groupMemberships[inviteMembershipId].link({
            group: groupId,
            user: userId,
            role: memberRoleId,
          })
        );

        // Create notification
        const notificationId = id();
        transactions.push(
          tx.notifications[notificationId].update({
            type: 'group_invite',
            title: 'Group Invitation',
            message: `${user.name || 'Someone'} invited you to join ${formData.name}`,
            createdAt: new Date(),
            isRead: false,
          }),
          tx.notifications[notificationId].link({
            recipient: userId,
            sender: user.id,
            relatedGroup: groupId,
          })
        );
      });

      // Create group relationships
      formData.groupLinks.forEach(link => {
        link.rights.forEach(right => {
          const relationshipId = id();
          const relationshipData = {
            withRight: right,
            relationshipType: link.relationshipType,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'requested',
            initiatorGroupId: groupId,
          };

          if (link.relationshipType === 'isParent') {
            transactions.push(
              tx.groupRelationships[relationshipId]
                .update(relationshipData)
                .link({ parentGroup: link.groupId, childGroup: groupId })
            );
          } else {
            transactions.push(
              tx.groupRelationships[relationshipId]
                .update(relationshipData)
                .link({ parentGroup: groupId, childGroup: link.groupId })
            );
          }
        });

        // Send notification to the target group about the relationship request
        if (user?.id) {
          const notificationTxs = notifyRelationshipRequested({
            senderId: user.id,
            sourceGroupId: groupId,
            sourceGroupName: formData.name,
            targetGroupId: link.groupId,
            targetGroupName: link.groupName,
            relationshipType: link.relationshipType === 'isParent' ? 'child' : 'parent',
          });
          transactions.push(...notificationTxs);
        }
      });

      // Create constitutional event if requested
      let eventId: string | undefined;
      if (formData.createConstitutionalEvent && formData.eventName) {
        eventId = id();
        const organizerRoleId = id();
        const organizerMembershipId = id();
        const eventParticipantRoleId = id();

        const startDateTime = new Date(`${formData.eventStartDate}T${formData.eventStartTime}`);

        // Get role templates
        const organizerTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Organizer');
        const participantTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Participant');

        // Create event
        transactions.push(
          tx.events[eventId].update({
            title: formData.eventName,
            description: '',
            location: formData.eventLocation || '',
            startDate: startDateTime,
            eventType: 'general_assembly',
            isPublic: formData.isPublic,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          tx.events[eventId].link({ group: groupId, creator: user.id })
        );

        // Create Organizer role
        transactions.push(
          tx.roles[organizerRoleId].update({
            name: 'Organizer',
            description: organizerTemplate?.description || 'Event organizer',
            scope: 'event',
            createdAt: new Date(),
          }),
          tx.roles[organizerRoleId].link({ event: eventId })
        );

        // Add permissions for Organizer role
        if (organizerTemplate) {
          organizerTemplate.permissions.forEach(perm => {
            const actionRightId = id();
            transactions.push(
              tx.actionRights[actionRightId]
                .update({
                  resource: perm.resource,
                  action: perm.action,
                })
                .link({ roles: organizerRoleId, event: eventId })
            );
          });
        }

        // Create Participant role
        transactions.push(
          tx.roles[eventParticipantRoleId].update({
            name: 'Participant',
            description: participantTemplate?.description || 'Event participant',
            scope: 'event',
            createdAt: new Date(),
          }),
          tx.roles[eventParticipantRoleId].link({ event: eventId })
        );

        // Add permissions for Participant role
        if (participantTemplate) {
          participantTemplate.permissions.forEach(perm => {
            const actionRightId = id();
            transactions.push(
              tx.actionRights[actionRightId]
                .update({
                  resource: perm.resource,
                  action: perm.action,
                })
                .link({ roles: eventParticipantRoleId, event: eventId })
            );
          });
        }

        // Add creator as Organizer with full event management rights
        transactions.push(
          tx.eventParticipants[organizerMembershipId].update({
            status: 'confirmed',
            createdAt: new Date(),
          }),
          tx.eventParticipants[organizerMembershipId].link({
            event: eventId,
            user: user.id,
            role: organizerRoleId,
          })
        );

        // Invite all group members to event as participants
        formData.invitedUserIds.forEach(userId => {
          const eventParticipationId = id();
          transactions.push(
            tx.eventParticipants[eventParticipationId].update({
              status: 'invited',
              createdAt: new Date(),
            }),
            tx.eventParticipants[eventParticipationId].link({
              event: eventId,
              user: userId,
              role: eventParticipantRoleId,
            })
          );

          // Create notification for event invitation
          const eventNotificationId = id();
          transactions.push(
            tx.notifications[eventNotificationId].update({
              type: 'event_invite',
              title: 'Event Invitation',
              message: `${user.name || 'Someone'} invited you to ${formData.eventName}`,
              createdAt: new Date(),
              isRead: false,
            }),
            tx.notifications[eventNotificationId].link({
              recipient: userId,
              sender: user.id,
              relatedEvent: eventId,
            })
          );
        });
      }

      await db.transact(transactions);

      toast.success(`Group ${t('pages.create.success.created')}`);
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error(t('pages.create.error.createFailed'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.group.title')}</CardTitle>
            </CardHeader>
            <div>
              <CardContent>
                <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                  <CarouselContent>
                    {/* Step 0: Basic Information */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="group-name">{t('pages.create.group.nameLabel')}</Label>
                          <Input
                            id="group-name"
                            placeholder={t('pages.create.group.namePlaceholder')}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="group-description">{t('pages.create.group.descriptionLabel')}</Label>
                          <Textarea
                            id="group-description"
                            placeholder={t('pages.create.group.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={e =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 1: Invite Members */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between">
                          <Label>{t('pages.create.group.inviteMembersOptional')}</Label>
                          <Badge variant="secondary">{formData.invitedUserIds.length} {t('pages.create.group.invited')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.create.group.searchUsers')}
                        </p>

                        <div className="space-y-3">
                          <TypeAheadSelect
                            items={searchedUsers}
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                            placeholder={t('pages.create.group.searchUsers')}
                            searchKeys={['name', 'handle', 'contactEmail']}
                            renderItem={(user: any) => <UserSelectCard user={user} />}
                            getItemId={(user: any) => user.id}
                          />

                          {/* Display last invited user */}
                          {lastInvitedUser && (
                            <div className="space-y-2">
                              <Label className="text-sm">{t('pages.create.group.lastInvited')}</Label>
                              <Card className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    {lastInvitedUser.avatar && (
                                      <AvatarImage src={lastInvitedUser.avatar} alt={lastInvitedUser.name || ''} />
                                    )}
                                    <AvatarFallback>
                                      {lastInvitedUser.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="font-medium">{lastInvitedUser.name || 'User'}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {lastInvitedUser.handle ? `@${lastInvitedUser.handle}` : lastInvitedUser.contactEmail}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUser(lastInvitedUser.id)}
                                    className="rounded-full p-2 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </Card>
                            </div>
                          )}

                          {/* Display all invited users */}
                          {formData.invitedUserIds.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm">{t('pages.create.group.allInvitedUsers')} ({invitedUsers.length})</Label>
                              <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
                                {invitedUsers.map((user: any) => (
                                  <Card key={user.id} className="p-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        {user.avatar && (
                                          <AvatarImage src={user.avatar} alt={user.name || ''} />
                                        )}
                                        <AvatarFallback className="text-xs">
                                          {user.name?.[0]?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">{user.name || 'User'}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {user.handle ? `@${user.handle}` : user.contactEmail}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="rounded-full p-1 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 2: Privacy & Hashtags */}
                    <CarouselItem>
                      <div className="space-y-6 p-4">
                        {/* Visibility */}
                        <VisibilitySelector
                          value={formData.visibility}
                          onChange={visibility => setFormData({ ...formData, visibility })}
                        />

                        {/* Hashtags */}
                        <div className="space-y-2 mt-2">
                          <HashtagInput
                            value={formData.hashtags}
                            onChange={hashtags => setFormData({ ...formData, hashtags })}
                            placeholder={t('pages.create.group.hashtagsPlaceholder')}
                          />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 3: Link Groups */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between">
                          <Label>{t('pages.create.group.linkGroupsOptional')}</Label>
                          <Badge variant="secondary">{formData.groupLinks.length} {t('pages.create.group.linked')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.create.group.requestRelationships')}
                        </p>

                        <div className="space-y-3">
                          {/* Group Selection */}
                          <div className="space-y-2">
                            <Label>{t('pages.create.group.selectGroup')}</Label>
                            <TypeAheadSelect
                              items={availableGroups}
                              value={selectedLinkGroupId}
                              onChange={setSelectedLinkGroupId}
                              placeholder={t('pages.create.group.searchGroups')}
                              searchKeys={['name', 'description']}
                              renderItem={(group: any) => <GroupSelectCard group={group} />}
                              getItemId={(group: any) => group.id}
                            />
                          </div>

                          {/* Relationship Type */}
                          {selectedLinkGroupId && (
                            <>
                              <div className="space-y-2">
                                <Label>{t('pages.create.group.relationshipType')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    type="button"
                                    variant={
                                      linkRelationshipType === 'isParent' ? 'default' : 'outline'
                                    }
                                    onClick={() => setLinkRelationshipType('isParent')}
                                  >
                                    {t('pages.create.group.theyAreParent')}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={
                                      linkRelationshipType === 'isChild' ? 'default' : 'outline'
                                    }
                                    onClick={() => setLinkRelationshipType('isChild')}
                                  >
                                    {t('pages.create.group.theyAreChild')}
                                  </Button>
                                </div>
                              </div>

                              {/* Rights Selection */}
                              <div className="space-y-2">
                                <Label>{t('pages.create.group.selectRights')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {RIGHTS.map(right => (
                                    <Button
                                      key={right.value}
                                      type="button"
                                      variant={selectedRights.has(right.value) ? 'default' : 'outline'}
                                      onClick={() => toggleRight(right.value)}
                                      className="h-auto py-3 justify-start"
                                    >
                                      {selectedRights.has(right.value) && (
                                        <Check className="mr-2 h-4 w-4" />
                                      )}
                                      <span className="text-sm">{right.label}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <Button
                                type="button"
                                onClick={handleAddGroupLink}
                                disabled={selectedRights.size === 0}
                                className="w-full"
                              >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                {t('pages.create.group.addGroupLink')}
                              </Button>
                            </>
                          )}

                          {/* Display linked groups */}
                          {formData.groupLinks.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <Label className="text-sm">{t('pages.create.group.linkedGroups')}</Label>
                              <div className="space-y-2">
                                {formData.groupLinks.map(link => (
                                  <Card key={link.groupId} className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">{link.groupName}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {link.relationshipType === 'isParent'
                                              ? 'Parent'
                                              : 'Child'}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {link.rights.map(right => (
                                            <Badge key={right} variant="secondary" className="text-xs">
                                              {RIGHTS.find(r => r.value === right)?.label}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveGroupLink(link.groupId)}
                                        className="rounded-full p-1 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Step 4: Constitutional Event */}
                    <CarouselItem>
                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="create-event" className="cursor-pointer">
                            {t('pages.create.group.createConstitutionalEvent')}
                          </Label>
                          <Switch
                            id="create-event"
                            checked={formData.createConstitutionalEvent}
                            onCheckedChange={checked =>
                              setFormData({ ...formData, createConstitutionalEvent: checked })
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.create.group.optionalGeneralAssembly')}
                        </p>

                        {formData.createConstitutionalEvent && (
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-name">{t('pages.create.group.eventName')}</Label>
                              <Input
                                id="event-name"
                                placeholder={t('pages.create.group.eventNamePlaceholder')}
                                value={formData.eventName}
                                onChange={e =>
                                  setFormData({ ...formData, eventName: e.target.value })
                                }
                                required={formData.createConstitutionalEvent}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="event-location">{t('pages.create.group.eventLocation')}</Label>
                              <Input
                                id="event-location"
                                placeholder={t('pages.create.group.eventLocationPlaceholder')}
                                value={formData.eventLocation}
                                onChange={e =>
                                  setFormData({ ...formData, eventLocation: e.target.value })
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="event-start-date">{t('pages.create.group.eventStartDate')}</Label>
                                <Input
                                  id="event-start-date"
                                  type="date"
                                  value={formData.eventStartDate}
                                  onChange={e =>
                                    setFormData({ ...formData, eventStartDate: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="event-start-time">{t('pages.create.group.eventStartTime')}</Label>
                                <Input
                                  id="event-start-time"
                                  type="time"
                                  value={formData.eventStartTime}
                                  onChange={e =>
                                    setFormData({ ...formData, eventStartTime: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <Card className="bg-muted/50 p-3">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div className="flex-1 text-sm text-muted-foreground">
                                  <p className="font-medium mb-1">{t('pages.create.group.eventTypeGeneralAssembly')}</p>
                                  <p>
                                    {t('pages.create.group.eventTypeDescription')}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </div>
                    </CarouselItem>

                    {/* Step 5: Review */}
                    <CarouselItem>
                      <div className="p-4">
                        <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50">
                          <CardHeader>
                            <div className="mb-2 flex items-center justify-between">
                              <Badge variant="default" className="text-xs">
                                Group
                              </Badge>
                              {formData.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {formData.name || t('pages.create.group.untitledGroup')}
                            </CardTitle>
                            {formData.description && (
                              <CardDescription>{formData.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <strong>{t('pages.create.group.visibilityLabel')}:</strong>
                              <Badge variant="secondary">{formData.visibility}</Badge>
                            </div>

                            {formData.hashtags.length > 0 && (
                              <div>
                                <strong className="text-sm block mb-1">{t('pages.create.group.hashtagsLabel')}:</strong>
                                <div className="flex flex-wrap gap-1">
                                  {formData.hashtags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {formData.invitedUserIds.length > 0 && (
                              <div>
                                <strong className="text-sm block mb-1">{t('pages.create.group.invitedMembersLabel')}:</strong>
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {(showAllInvitedInSummary ? invitedUsers : invitedUsers.slice(0, 3)).map((user: any) => (
                                      <div key={user.id} className="flex items-center gap-1.5 rounded-md border bg-background/50 px-2 py-1">
                                        <Avatar className="h-5 w-5">
                                          {user.avatar && (
                                            <AvatarImage src={user.avatar} alt={user.name || ''} />
                                          )}
                                          <AvatarFallback className="text-xs">
                                            {user.name?.[0]?.toUpperCase() || '?'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{user.name || 'User'}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {formData.invitedUserIds.length > 3 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowAllInvitedInSummary(!showAllInvitedInSummary)}
                                      className="h-auto py-1 text-xs"
                                    >
                                      {showAllInvitedInSummary
                                        ? t('pages.create.common.showLess')
                                        : `${t('pages.create.common.show')} ${formData.invitedUserIds.length - 3} ${t('pages.create.common.more')}`}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                            {formData.groupLinks.length > 0 && (
                              <div>
                                <strong className="text-sm block mb-1">{t('pages.create.group.groupLinksLabel')}:</strong>
                                <div className="space-y-1">
                                  {formData.groupLinks.map(link => (
                                    <div key={link.groupId} className="text-xs text-muted-foreground">
                                      • {link.groupName} ({link.relationshipType === 'isParent' ? t('pages.create.group.parent') : t('pages.create.group.child')})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {formData.createConstitutionalEvent && formData.eventName && (
                              <div>
                                <strong className="text-sm block mb-1">{t('pages.create.group.constitutionalEventLabel')}:</strong>
                                <Card className="p-2 bg-background/50">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formData.eventName}</span>
                                  </div>
                                  {formData.eventLocation && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      📍 {formData.eventLocation}
                                    </div>
                                  )}
                                </Card>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                <div className="mt-4 flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map(index => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentStep === index ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => carouselApi?.scrollPrev()}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  {t('pages.create.common.previous')}
                </Button>
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => carouselApi?.scrollNext()}
                    disabled={currentStep === 0 && !formData.name}
                  >
                    {t('pages.create.common.next')}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}>
                    {isSubmitting ? t('pages.create.common.creating') : t('pages.create.group.createGroup')}
                  </Button>
                )}
              </CardFooter>
            </div>
          </Card>
        </TooltipProvider>
      </PageWrapper>
    </AuthGuard>
  );
}
