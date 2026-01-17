'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Users,
  Calendar,
  FileText,
  BookOpen,
  CheckSquare,
  Heart,
  Send,
  Clock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { TimelineRefreshFrequency } from '../types/notification-settings.types';
import { PushNotificationToggle } from '@/components/push-notification-toggle';

interface NotificationSettingsPageProps {
  userId: string;
}

interface SettingItemProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  adminOnly?: boolean;
}

function SettingItem({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  adminOnly,
}: SettingItemProps) {
  return (
    <div className="flex items-center justify-between space-x-4 py-3">
      <div className="flex-1 space-y-0.5">
        <Label className="text-sm font-medium">
          {label}
          {adminOnly && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Admin only
            </span>
          )}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export function NotificationSettingsPage({ userId }: NotificationSettingsPageProps) {
  const {
    settings,
    isLoading,
    isUpdating,
    updateGroupNotifications,
    updateEventNotifications,
    updateAmendmentNotifications,
    updateBlogNotifications,
    updateTodoNotifications,
    updateSocialNotifications,
    updateDeliverySettings,
    updateTimelineSettings,
    resetToDefaults,
  } = useNotificationSettings(userId);

  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await resetToDefaults();
    setResetting(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage how you receive notifications for different activities
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={resetting || isUpdating}
        >
          {resetting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Reset to defaults
        </Button>
      </div>

      <Tabs defaultValue="delivery" className="w-full">
        <ScrollableTabsList className="mb-6">
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="amendments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Amendments
          </TabsTrigger>
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </ScrollableTabsList>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Delivery Settings
              </CardTitle>
              <CardDescription>
                Control how notifications are delivered to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-4 py-3">
                <div className="flex-1 space-y-0.5">
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive browser push notifications even when the app is closed
                  </p>
                </div>
                <PushNotificationToggle variant="minimal" />
              </div>
              <Separator />
              <SettingItem
                label="In-App Notifications"
                description="Show notifications within the app"
                checked={settings.deliverySettings.inAppNotifications}
                onCheckedChange={(checked) =>
                  updateDeliverySettings({ inAppNotifications: checked })
                }
                disabled={isUpdating}
              />
              <Separator />
              <SettingItem
                label="Email Notifications"
                description="Receive notification digests via email (coming soon)"
                checked={settings.deliverySettings.emailNotifications}
                onCheckedChange={(checked) =>
                  updateDeliverySettings({ emailNotifications: checked })
                }
                disabled={true} // Email not yet implemented
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Notifications */}
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Notifications
              </CardTitle>
              <CardDescription>
                Notifications for groups you're a member of
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="Tasks Assigned"
                description="When a task is assigned to you in a group"
                checked={settings.groupNotifications.tasksAssigned}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ tasksAssigned: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Payment Notifications"
                description="Payment-related updates"
                checked={settings.groupNotifications.paymentNotifications}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ paymentNotifications: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Events"
                description="When new events are created in the group"
                checked={settings.groupNotifications.newEvents}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newEvents: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Amendments"
                description="When new amendments are linked to the group"
                checked={settings.groupNotifications.newAmendments}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newAmendments: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Relationships"
                description="When parent/child group relationships are formed"
                checked={settings.groupNotifications.newRelationships}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newRelationships: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Positions"
                description="When new positions are created"
                checked={settings.groupNotifications.newPositions}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newPositions: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Documents"
                description="When documents are shared"
                checked={settings.groupNotifications.newDocuments}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newDocuments: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Members"
                description="When new members join"
                checked={settings.groupNotifications.newMembers}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newMembers: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Role Updates"
                description="When roles are promoted or demoted"
                checked={settings.groupNotifications.roleUpdates}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ roleUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Subscribers"
                description="When users subscribe to the group"
                checked={settings.groupNotifications.newSubscribers}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ newSubscribers: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Profile Updates"
                description="When group details are updated"
                checked={settings.groupNotifications.profileUpdates}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ profileUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Membership Requests"
                description="When users request to join"
                checked={settings.groupNotifications.membershipRequests}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ membershipRequests: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Membership Invitations"
                description="When you're invited to join"
                checked={settings.groupNotifications.membershipInvitations}
                onCheckedChange={(checked) =>
                  updateGroupNotifications({ membershipInvitations: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Notifications */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Notifications
              </CardTitle>
              <CardDescription>
                Notifications for events you're participating in
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="Agenda Items"
                description="When agenda items are added or changed"
                checked={settings.eventNotifications.agendaItems}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ agendaItems: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Elections"
                description="Election events and results"
                checked={settings.eventNotifications.elections}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ elections: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Votes"
                description="Voting sessions and results"
                checked={settings.eventNotifications.votes}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ votes: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Schedule Changes"
                description="When event date or time changes"
                checked={settings.eventNotifications.scheduleChanges}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ scheduleChanges: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Participants"
                description="When new participants join"
                checked={settings.eventNotifications.newParticipants}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ newParticipants: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Role Updates"
                description="When participant roles change"
                checked={settings.eventNotifications.roleUpdates}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ roleUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Position Changes"
                description="When positions are filled or vacated"
                checked={settings.eventNotifications.positionChanges}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ positionChanges: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Profile Updates"
                description="When event details are updated"
                checked={settings.eventNotifications.profileUpdates}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ profileUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Subscribers"
                description="When users subscribe to the event"
                checked={settings.eventNotifications.newSubscribers}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ newSubscribers: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Participation Requests"
                description="When users request to participate"
                checked={settings.eventNotifications.participationRequests}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ participationRequests: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Participation Invitations"
                description="When you're invited to participate"
                checked={settings.eventNotifications.participationInvitations}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ participationInvitations: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Delegate Nominations"
                description="Delegate nomination events"
                checked={settings.eventNotifications.delegateNominations}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ delegateNominations: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Speaker List Additions"
                description="When you're added to speaker list"
                checked={settings.eventNotifications.speakerListAdditions}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ speakerListAdditions: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Meeting Bookings"
                description="Meeting slot bookings"
                checked={settings.eventNotifications.meetingBookings}
                onCheckedChange={(checked) =>
                  updateEventNotifications({ meetingBookings: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amendment Notifications */}
        <TabsContent value="amendments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Amendment Notifications
              </CardTitle>
              <CardDescription>
                Notifications for amendments you're collaborating on
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="Change Requests"
                description="When change requests are created"
                checked={settings.amendmentNotifications.changeRequests}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ changeRequests: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Change Request Decisions"
                description="When change requests are accepted or rejected"
                checked={settings.amendmentNotifications.changeRequestDecisions}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ changeRequestDecisions: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Collaborators"
                description="When collaborators join"
                checked={settings.amendmentNotifications.newCollaborators}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ newCollaborators: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Role Updates"
                description="When collaborator roles change"
                checked={settings.amendmentNotifications.roleUpdates}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ roleUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Upvotes/Downvotes"
                description="When your amendment receives votes"
                checked={settings.amendmentNotifications.upvotesDownvotes}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ upvotesDownvotes: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="New Subscribers"
                description="When users subscribe to the amendment"
                checked={settings.amendmentNotifications.newSubscribers}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ newSubscribers: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Process Progress"
                description="When the amendment advances through governance"
                checked={settings.amendmentNotifications.processProgress}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ processProgress: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Supporting Groups"
                description="When groups add support"
                checked={settings.amendmentNotifications.supportingGroups}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ supportingGroups: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Clones"
                description="When your amendment is cloned"
                checked={settings.amendmentNotifications.clones}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ clones: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Discussions"
                description="Comments and discussion threads"
                checked={settings.amendmentNotifications.discussions}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ discussions: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Profile Updates"
                description="When amendment details change"
                checked={settings.amendmentNotifications.profileUpdates}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ profileUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Workflow Changes"
                description="When workflow status changes"
                checked={settings.amendmentNotifications.workflowChanges}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ workflowChanges: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Collaboration Requests"
                description="When users request to collaborate"
                checked={settings.amendmentNotifications.collaborationRequests}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ collaborationRequests: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Collaboration Invitations"
                description="When you're invited to collaborate"
                checked={settings.amendmentNotifications.collaborationInvitations}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ collaborationInvitations: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Voting Sessions"
                description="Voting session events"
                checked={settings.amendmentNotifications.votingSessions}
                onCheckedChange={(checked) =>
                  updateAmendmentNotifications({ votingSessions: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Notifications */}
        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Blog Notifications
              </CardTitle>
              <CardDescription>
                Notifications for blogs you're writing for
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="New Subscribers"
                description="When users subscribe to the blog"
                checked={settings.blogNotifications.newSubscribers}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ newSubscribers: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Upvotes/Downvotes"
                description="When your posts receive votes"
                checked={settings.blogNotifications.upvotesDownvotes}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ upvotesDownvotes: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Profile Updates"
                description="When blog details change"
                checked={settings.blogNotifications.profileUpdates}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ profileUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="New Writers"
                description="When new writers join"
                checked={settings.blogNotifications.newWriters}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ newWriters: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Role Updates"
                description="When writer roles change"
                checked={settings.blogNotifications.roleUpdates}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ roleUpdates: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Comments"
                description="Comments on blog posts"
                checked={settings.blogNotifications.comments}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ comments: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Writer Requests"
                description="When users request to write"
                checked={settings.blogNotifications.writerRequests}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ writerRequests: checked })
                }
                disabled={isUpdating}
                adminOnly
              />
              <SettingItem
                label="Writer Invitations"
                description="When you're invited to write"
                checked={settings.blogNotifications.writerInvitations}
                onCheckedChange={(checked) =>
                  updateBlogNotifications({ writerInvitations: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Todo Notifications */}
        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Todo Notifications
              </CardTitle>
              <CardDescription>
                Notifications for your tasks and assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="Task Assigned"
                description="When a task is assigned to you"
                checked={settings.todoNotifications.taskAssigned}
                onCheckedChange={(checked) =>
                  updateTodoNotifications({ taskAssigned: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Task Updated"
                description="When task details change"
                checked={settings.todoNotifications.taskUpdated}
                onCheckedChange={(checked) =>
                  updateTodoNotifications({ taskUpdated: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Task Completed"
                description="When tasks you created are completed"
                checked={settings.todoNotifications.taskCompleted}
                onCheckedChange={(checked) =>
                  updateTodoNotifications({ taskCompleted: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Due Date Reminders"
                description="Reminders before tasks are due"
                checked={settings.todoNotifications.dueDateReminders}
                onCheckedChange={(checked) =>
                  updateTodoNotifications({ dueDateReminders: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Overdue Alerts"
                description="Alerts when tasks are overdue"
                checked={settings.todoNotifications.overdueAlerts}
                onCheckedChange={(checked) =>
                  updateTodoNotifications({ overdueAlerts: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Notifications */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Social Notifications
              </CardTitle>
              <CardDescription>
                Notifications for social interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingItem
                label="New Followers"
                description="When someone follows you"
                checked={settings.socialNotifications.newFollowers}
                onCheckedChange={(checked) =>
                  updateSocialNotifications({ newFollowers: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Mentions"
                description="When you're mentioned in content"
                checked={settings.socialNotifications.mentions}
                onCheckedChange={(checked) =>
                  updateSocialNotifications({ mentions: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Direct Messages"
                description="New direct messages"
                checked={settings.socialNotifications.directMessages}
                onCheckedChange={(checked) =>
                  updateSocialNotifications({ directMessages: checked })
                }
                disabled={isUpdating}
              />
              <SettingItem
                label="Conversation Requests"
                description="When someone wants to start a conversation"
                checked={settings.socialNotifications.conversationRequests}
                onCheckedChange={(checked) =>
                  updateSocialNotifications({ conversationRequests: checked })
                }
                disabled={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Settings */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline Settings
              </CardTitle>
              <CardDescription>
                Configure your timeline feed preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingItem
                label="Show Timeline on Homepage"
                description="Display your subscribed content feed on the homepage"
                checked={settings.timelineSettings.showOnHomepage}
                onCheckedChange={(checked) =>
                  updateTimelineSettings({ showOnHomepage: checked })
                }
                disabled={isUpdating}
              />
              <Separator />
              <div className="flex items-center justify-between space-x-4 py-3">
                <div className="flex-1 space-y-0.5">
                  <Label className="text-sm font-medium">Refresh Frequency</Label>
                  <p className="text-xs text-muted-foreground">
                    How often the timeline automatically refreshes
                  </p>
                </div>
                <Select
                  value={settings.timelineSettings.refreshFrequency}
                  onValueChange={(value: TimelineRefreshFrequency) =>
                    updateTimelineSettings({ refreshFrequency: value })
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="every5min">Every 5 minutes</SelectItem>
                    <SelectItem value="every15min">Every 15 minutes</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
