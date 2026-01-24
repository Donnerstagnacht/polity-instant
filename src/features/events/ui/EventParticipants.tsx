import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  UserPlus,
  UserX,
  Shield,
  Clock,
  Check,
  X,
  Loader2,
  Search,
  Plus,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEventParticipants, ACTION_RIGHTS } from '../hooks/useEventParticipants';
import { useTranslation } from '@/hooks/use-translation';

export function EventParticipants({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const {
    event,
    isLoading,
    error,
    currentUserId,
    rolesData,
    filteredUsers,
    isLoadingUsers,
    state,
    derived,
    actions,
  } = useEventParticipants(eventId);

  if (isLoading) {
    return <div className="container mx-auto p-4">{t('features.events.participants.loading')}</div>;
  }

  if (error || !event) {
    return (
      <div className="container mx-auto p-4">{t('features.events.participants.notFound')}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={actions.goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('features.events.participants.back')}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">
          {t('features.events.participants.manageParticipants')}
        </h1>
        <p className="text-muted-foreground">
          {t('features.events.participants.event')}: {event.title}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('features.events.participants.searchPlaceholder')}
            value={state.searchQuery}
            onChange={e => state.setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs for Participants and Roles */}
      <Tabs value={state.activeTab} onValueChange={state.setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">
            {t('features.events.participants.tabs.participants')}
          </TabsTrigger>
          <TabsTrigger value="roles">{t('features.events.participants.tabs.roles')}</TabsTrigger>
        </TabsList>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          {/* Invite Section */}
          <div>
            <Dialog open={state.inviteDialogOpen} onOpenChange={state.setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('features.events.participants.invite')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t('features.events.participants.inviteTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('features.events.participants.inviteDescription')}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  {/* Search and selection UI */}
                  <Command className="rounded-lg border">
                    <CommandInput
                      placeholder={t('features.events.participants.searchUsersPlaceholder')}
                      value={state.inviteSearchQuery}
                      onValueChange={state.setInviteSearchQuery}
                    />
                    <CommandList>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>
                            {t('features.events.participants.noUsersFound')}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredUsers?.map(user => {
                              if (!user?.id) return null;
                              const userId = user.id;
                              const isSelected = state.selectedUsers.includes(userId);
                              return (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.name} ${user.handle} ${user.contactEmail}`}
                                  onSelect={() => actions.toggleUserSelection(userId)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-1 items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      {user.avatar ? (
                                        <AvatarImage src={user.avatar} alt={user.name || ''} />
                                      ) : null}
                                      <AvatarFallback>
                                        {user.name?.[0]?.toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {user.name || 'Unnamed User'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {user.handle ? `@${user.handle}` : user.contactEmail}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="ml-2 h-4 w-4 text-primary" strokeWidth={3} />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>

                  {/* Selected users display */}
                  {state.selectedUsers.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-sm font-medium">
                        {t('features.events.participants.selected', {
                          count: state.selectedUsers.length,
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {state.selectedUsers.map(userId => {
                          const user = filteredUsers?.find(u => u?.id === userId);
                          // Note: filteredUsers might not contain selected users if search query changed
                          // But for now this is fine as we are just displaying names
                          // Ideally we should look up in full users list or keep selected user objects

                          return (
                            <Badge key={userId} variant="secondary" className="gap-1 pr-1">
                              <span>{user?.name || 'User'}</span>
                              <button
                                onClick={() => actions.toggleUserSelection(userId)}
                                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => state.setInviteDialogOpen(false)}
                    disabled={state.isInviting}
                  >
                    {t('features.events.cancelLabel')}
                  </Button>
                  <Button
                    onClick={actions.inviteUsers}
                    disabled={state.selectedUsers.length === 0 || state.isInviting}
                  >
                    {state.isInviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('features.events.participants.inviting')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('features.events.participants.inviteCount', {
                          count: state.selectedUsers.length,
                        })}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pending Requests */}
          {derived.pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Clock className="h-5 w-5" />
                {t('features.events.participants.pendingRequests', {
                  count: derived.pendingRequests.length,
                })}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('features.events.participants.table.user')}</TableHead>
                    <TableHead>{t('features.events.participants.table.email')}</TableHead>
                    <TableHead>{t('features.events.participants.table.requested')}</TableHead>
                    <TableHead>{t('features.events.participants.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {derived.pendingRequests.map((participant: any) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatar} />
                            <AvatarFallback>
                              {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {participant.user?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                      <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => actions.acceptRequest(participant.id)}>
                            {t('features.events.participants.actions.accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actions.removeParticipant(participant.id)}
                          >
                            {t('features.events.participants.actions.decline')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Active Participants */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">
              {t('features.events.participants.activeParticipants', {
                count: derived.activeParticipants.length,
              })}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('features.events.participants.table.user')}</TableHead>
                  <TableHead>{t('features.events.participants.table.email')}</TableHead>
                  <TableHead>{t('features.events.participants.table.role')}</TableHead>
                  <TableHead>{t('features.events.participants.table.joined')}</TableHead>
                  <TableHead>{t('features.events.participants.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {derived.activeParticipants.map((participant: any) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.user?.avatar} />
                          <AvatarFallback>
                            {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {participant.user?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={participant.role?.name || 'Participant'}
                        onValueChange={newRole => actions.changeRole(participant.id, newRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rolesData?.roles?.map((roleOption: any) => (
                            <SelectItem key={roleOption.id} value={roleOption.name}>
                              {roleOption.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {participant.role?.name !== 'Organizer' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actions.changeRole(participant.id, 'Organizer')}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            {t('features.events.participants.actions.makeOrganizer')}
                          </Button>
                        )}
                        {participant.role?.name === 'Organizer' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actions.changeRole(participant.id, 'Participant')}
                          >
                            {t('features.events.participants.actions.removeOrganizer')}
                          </Button>
                        )}
                        {participant.user?.id !== currentUserId && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => actions.removeParticipant(participant.id)}
                          >
                            <UserX className="mr-1 h-4 w-4" />
                            {t('features.events.participants.actions.remove')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Invited Users */}
          {derived.invitedUsers.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                {t('features.events.participants.pendingInvitations', {
                  count: derived.invitedUsers.length,
                })}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('features.events.participants.table.user')}</TableHead>
                    <TableHead>{t('features.events.participants.table.email')}</TableHead>
                    <TableHead>{t('features.events.participants.table.invited')}</TableHead>
                    <TableHead>{t('features.events.participants.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {derived.invitedUsers.map((participant: any) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatar} />
                            <AvatarFallback>
                              {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {participant.user?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                      <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actions.removeParticipant(participant.id)}
                        >
                          {t('features.events.participants.actions.cancelInvitation')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('features.events.participants.roles.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('features.events.participants.roles.description')}
                  </CardDescription>
                </div>
                <Dialog open={state.addRoleDialogOpen} onOpenChange={state.setAddRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('features.events.participants.roles.addRole')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t('features.events.participants.roles.addRoleTitle')}
                      </DialogTitle>
                      <DialogDescription>
                        {t('features.events.participants.roles.addRoleDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="role-name" className="text-sm font-medium">
                          {t('features.events.participants.roles.roleName')}
                        </label>
                        <Input
                          id="role-name"
                          placeholder={t('features.events.participants.roles.roleNamePlaceholder')}
                          value={state.newRoleName}
                          onChange={e => state.setNewRoleName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role-description" className="text-sm font-medium">
                          {t('features.events.participants.roles.roleDescription')}
                        </label>
                        <Input
                          id="role-description"
                          placeholder={t(
                            'features.events.participants.roles.roleDescriptionPlaceholder'
                          )}
                          value={state.newRoleDescription}
                          onChange={e => state.setNewRoleDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => state.setAddRoleDialogOpen(false)}
                      >
                        {t('features.events.cancelLabel')}
                      </Button>
                      <Button type="button" onClick={actions.addRole}>
                        {t('features.events.participants.roles.createRole')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {rolesData?.roles && rolesData.roles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">
                          {t('features.events.participants.roles.actionRight')}
                        </TableHead>
                        {rolesData.roles.map((role: any) => (
                          <TableHead key={role.id} className="min-w-[120px] text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">{role.name}</span>
                              {role.description && (
                                <span className="text-xs font-normal text-muted-foreground">
                                  {role.description}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-6 w-6 p-0"
                                onClick={() => actions.removeRole(role.id)}
                              >
                                <UserX className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ACTION_RIGHTS.map(({ resource, action, label }) => {
                        const rightKey = `${resource}-${action}`;
                        return (
                          <TableRow key={rightKey}>
                            <TableCell className="font-medium">{label}</TableCell>
                            {rolesData.roles.map((role: any) => {
                              const hasRight = role.actionRights?.some(
                                (ar: any) => ar.resource === resource && ar.action === action
                              );
                              return (
                                <TableCell key={role.id} className="text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={hasRight}
                                      onCheckedChange={() =>
                                        actions.toggleActionRight(
                                          role.id,
                                          resource,
                                          action,
                                          hasRight
                                        )
                                      }
                                    />
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    {t('features.events.participants.roles.noRoles')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
