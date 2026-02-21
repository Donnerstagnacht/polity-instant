'use client';

import { useState } from 'react';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useUserState } from '@/zero/users/useUserState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  UserPlus,
  UserX,
  Loader2,
  Search,
  Plus,
  X,
  Check,
  Trash2,
  Shield,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
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
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/zero/rbac/usePermissions';
import type { User } from '@/zero';
import {
  notifyBloggerInvited,
  notifyBloggerRoleChanged,
  notifyBloggerRemoved,
  notifyBlogRoleCreated,
  notifyBlogRoleDeleted,
} from '@/utils/notification-helpers';

// Define available action rights for blogs
const ACTION_RIGHTS = [
  { resource: 'blogs', action: 'update', label: 'Update Blog' },
  { resource: 'blogs', action: 'delete', label: 'Delete Blog' },
  { resource: 'blogBloggers', action: 'manage', label: 'Manage Bloggers' },
];

function displayName(u: Pick<User, 'first_name' | 'last_name'> | undefined | null): string {
  if (!u) return 'Unknown';
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown';
}

function initials(u: Pick<User, 'first_name' | 'last_name'> | undefined | null): string {
  if (!u) return 'U';
  return u.first_name?.charAt(0) || u.last_name?.charAt(0) || 'U';
}

interface BlogBloggersManagerProps {
  blogId: string;
}

export function BlogBloggersManager({ blogId }: BlogBloggersManagerProps) {
  const blogActions = useBlogActions();
  const groupActions = useGroupActions();
  const { blogWithManagement } = useBlogState({ blogId, includeManagement: true });
  const { allUsers } = useUserState({ includeAllUsers: true });
  const usersData = allUsers;

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('bloggers');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  const blog = blogWithManagement;
  const bloggers = blog?.bloggers || [];
  const rolesData = { roles: blog?.roles || [] };
  const isLoading = !blogWithManagement;
  const isLoadingUsers = !usersData;
  const error = null;

  // Check if current user is owner
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Use permission hooks to check access
  const { can } = usePermissions({ blogId });
  const canManageBloggers = can('manage', 'blogBloggers');

  // Get existing blogger IDs to exclude from invite search
  const existingBloggerIds = bloggers.map(b => b.user_id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.filter(u => {
    if (!u?.id) return false;
    if (existingBloggerIds.includes(u.id)) return false;

    const q = inviteSearchQuery.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.handle?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleInviteBloggers = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      // Find Writer role ID
      const writerRole = rolesData.roles.find(r => r.name === 'Writer');
      if (!writerRole) {
        throw new Error('Writer role not found');
      }

      for (const userId of selectedUsers) {
        const bloggerId = crypto.randomUUID();
        await blogActions.createEntry({
          id: bloggerId,
          status: 'invited',
          user_id: userId,
          blog_id: blogId,
          role_id: writerRole.id,
          visibility: '',
        });
      }

      // Send notifications to invited users
      if (currentUserId) {
        for (const userId of selectedUsers) {
          await notifyBloggerInvited({
            senderId: currentUserId,
            recipientUserId: userId,
            blogId,
            blogTitle: blog?.title || 'Blog',
          });
        }
      }

      toast.success(
        `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'blogger' : 'bloggers'}`
      );

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite bloggers:', error);
      toast.error('Failed to invite bloggers. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  // Handle role updates
  const handleUpdateRole = async (bloggerId: string, newRoleId: string, userId?: string) => {
    try {
      await blogActions.updateEntry({ id: bloggerId, role_id: newRoleId });

      // Send notification to the blogger about role change
      if (currentUserId && userId) {
        const newRole = rolesData.roles.find(r => r.id === newRoleId);
        await notifyBloggerRoleChanged({
          senderId: currentUserId,
          recipientUserId: userId,
          blogId,
          blogTitle: blog?.title || 'Blog',
          newRole: newRole?.name || 'Unknown Role',
        });
      }
      toast.success('Blogger role updated successfully');
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Failed to update blogger role');
    }
  };

  // Handle removing blogger
  const handleRemoveBlogger = async (bloggerId: string, userId?: string) => {
    try {
      await blogActions.deleteEntry(bloggerId);

      // Send notification to the removed blogger
      if (currentUserId && userId) {
        await notifyBloggerRemoved({
          senderId: currentUserId,
          recipientUserId: userId,
          blogId,
          blogTitle: blog?.title || 'Blog',
        });
      }
      toast.success('Blogger removed successfully');
    } catch (err) {
      console.error('Error removing blogger:', err);
      toast.error('Failed to remove blogger');
    }
  };

  // Handle adding action right to role
  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHasRight: boolean
  ) => {
    try {
      if (currentlyHasRight) {
        // Find and remove the action right
        const foundRole = rolesData.roles.find(r => r.id === roleId);
        const actionRightToRemove = foundRole?.action_rights?.find(
          ar => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await groupActions.removeActionRight({ id: actionRightToRemove.id });
        }
      } else {
        // Add the action right
        const actionRightId = crypto.randomUUID();
        await groupActions.assignActionRight({
          id: actionRightId,
          resource,
          action,
          role_id: roleId,
          blog_id: blogId,
          group_id: '',
          event_id: '',
          amendment_id: '',
        });
      }
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Failed to toggle action right:', error);
      toast.error('Failed to update permission');
    }
  };

  // Handle creating new role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      const roleId = crypto.randomUUID();
      await groupActions.createRole({
        id: roleId,
        name: newRoleName,
        description: newRoleDescription,
        scope: 'blog',
        blog_id: blogId,
        group_id: '',
        event_id: '',
        amendment_id: '',
      });

      // Send notification about new role
      if (currentUserId) {
        await notifyBlogRoleCreated({
          senderId: currentUserId,
          blogId,
          blogTitle: blog?.title || 'Blog',
          roleName: newRoleName,
        });
      }

      toast.success('Role created successfully');

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role. Please try again.');
    }
  };

  // Handle deleting a role
  const handleDeleteRole = async (roleId: string, roleName?: string) => {
    try {
      await groupActions.deleteRole({ id: roleId });

      // Send notification about role deletion
      if (currentUserId && roleName) {
        await notifyBlogRoleDeleted({
          senderId: currentUserId,
          blogId,
          blogTitle: blog?.title || 'Blog',
          roleName,
        });
      }
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role. Please try again.');
    }
  };

  // Filter bloggers based on search and status
  const filteredBloggers = bloggers.filter(blogger => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      displayName(blogger.user).toLowerCase().includes(q) ||
      blogger.user?.handle?.toLowerCase().includes(q) ||
      blogger.user?.email?.toLowerCase().includes(q);

    return matchesSearch;
  });

  // Separate bloggers by status
  const activeBloggers = filteredBloggers.filter(b => b.status === 'member');
  const invitedBloggers = filteredBloggers.filter(b => b.status === 'invited');
  const requestedBloggers = filteredBloggers.filter(b => b.status === 'requested');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Blog not found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        <h1 className="text-3xl font-bold">Manage Bloggers</h1>
        <p className="text-muted-foreground mt-2">
          Manage blogger access, roles, and permissions for {blog.title}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search bloggers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {canManageBloggers && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Bloggers
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Invite Bloggers</DialogTitle>
                  <DialogDescription>
                    Search and select users to invite as bloggers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Command className="rounded-lg border">
                    <CommandInput
                      placeholder="Search users..."
                      value={inviteSearchQuery}
                      onValueChange={setInviteSearchQuery}
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {isLoadingUsers ? (
                          <div className="p-4 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          filteredUsers?.map(u => (
                            <CommandItem
                              key={u.id}
                              className="flex cursor-pointer items-center space-x-2"
                              onSelect={() => toggleUserSelection(u.id)}
                            >
                              <Checkbox
                                checked={selectedUsers.includes(u.id)}
                                onCheckedChange={() => toggleUserSelection(u.id)}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatar || ''} />
                                <AvatarFallback>{initials(u)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{displayName(u)}</div>
                                <div className="text-muted-foreground text-sm">
                                  @{u.handle || u.email || 'unknown'}
                                </div>
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  {selectedUsers.length > 0 && (
                    <div className="text-muted-foreground text-sm">
                      Selected: {selectedUsers.length}{' '}
                      {selectedUsers.length === 1 ? 'user' : 'users'}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteBloggers}
                    disabled={selectedUsers.length === 0 || isInviting}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      `Invite ${selectedUsers.length || ''} ${selectedUsers.length === 1 ? 'Blogger' : 'Bloggers'}`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollableTabsList>
          <TabsTrigger value="bloggers">Bloggers ({filteredBloggers.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({rolesData.roles.length})</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="bloggers" className="space-y-4">
          {/* Invited Bloggers */}
          {invitedBloggers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invited Bloggers</CardTitle>
                <CardDescription>
                  Users who have been invited but haven't accepted yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitedBloggers.map(blogger => {
                      const createdAt = blogger.created_at
                        ? new Date(blogger.created_at).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={blogger.user?.avatar || ''} />
                                <AvatarFallback>{initials(blogger.user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{displayName(blogger.user)}</div>
                                <div className="text-muted-foreground text-sm">
                                  @{blogger.user?.handle || 'unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{blogger.role?.name || 'No role'}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                          <TableCell className="text-right">
                            {canManageBloggers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBlogger(blogger.id)}
                              >
                                <UserX className="h-4 w-4" />
                                <span className="ml-2">Cancel</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Active Bloggers */}
          <Card>
            <CardHeader>
              <CardTitle>Active Bloggers</CardTitle>
              <CardDescription>Users with blogger access to this blog</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBloggers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  {bloggers.length === 0
                    ? 'No active bloggers yet'
                    : 'No active bloggers match your search'}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBloggers.map(blogger => {
                      const createdAt = blogger.created_at
                        ? new Date(blogger.created_at).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={blogger.user?.avatar || ''} />
                                <AvatarFallback>{initials(blogger.user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{displayName(blogger.user)}</div>
                                <div className="text-muted-foreground text-sm">
                                  @{blogger.user?.handle || 'unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {canManageBloggers && blogger.user?.id !== currentUserId ? (
                              <Select
                                value={blogger.role?.id}
                                onValueChange={newRoleId =>
                                  handleUpdateRole(blogger.id, newRoleId, blogger.user?.id)
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rolesData.roles.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                      {r.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge>{blogger.role?.name || 'No role'}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                          <TableCell className="text-right">
                            {canManageBloggers && blogger.user?.id !== currentUserId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBlogger(blogger.id)}
                              >
                                <UserX className="h-4 w-4" />
                                <span className="ml-2">Remove</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          {requestedBloggers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Users who have requested to be bloggers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestedBloggers.map(blogger => {
                      const createdAt = blogger.created_at
                        ? new Date(blogger.created_at).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={blogger.user?.avatar || ''} />
                                <AvatarFallback>{initials(blogger.user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{displayName(blogger.user)}</div>
                                <div className="text-muted-foreground text-sm">
                                  @{blogger.user?.handle || 'unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{blogger.role?.name || 'No role'}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                          <TableCell className="text-right">
                            {canManageBloggers && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    blogActions.updateEntry({
                                      id: blogger.id,
                                      status: 'member',
                                    });
                                  }}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveBlogger(blogger.id)}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Permissions
                  </CardTitle>
                  <CardDescription>
                    Manage roles and their permissions for this blog
                  </CardDescription>
                </div>
                {canManageBloggers && (
                  <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                        <DialogDescription>
                          Create a new role with custom permissions for this blog.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="role-name" className="text-sm font-medium">
                            Role Name
                          </label>
                          <Input
                            id="role-name"
                            placeholder="e.g., Editor, Contributor"
                            value={newRoleName}
                            onChange={e => setNewRoleName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="role-description" className="text-sm font-medium">
                            Description (Optional)
                          </label>
                          <Input
                            id="role-description"
                            placeholder="Describe this role's purpose"
                            value={newRoleDescription}
                            onChange={e => setNewRoleDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddRoleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateRole}>
                          Create Role
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {rolesData.roles && rolesData.roles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Permission</TableHead>
                        {rolesData.roles.map(r => (
                          <TableHead key={r.id} className="min-w-[120px] text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">{r.name}</span>
                              {r.description && (
                                <span className="text-muted-foreground text-xs font-normal">
                                  {r.description}
                                </span>
                              )}
                              {canManageBloggers && r.name !== 'Owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 w-6 p-0"
                                  onClick={() => handleDeleteRole(r.id)}
                                >
                                  <Trash2 className="text-destructive h-3 w-3" />
                                </Button>
                              )}
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
                            {rolesData.roles.map(r => {
                              const hasRight = r.action_rights?.some(
                                ar => ar.resource === resource && ar.action === action
                              );
                              return (
                                <TableCell key={r.id} className="text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={hasRight}
                                      disabled={!canManageBloggers}
                                      onCheckedChange={() =>
                                        handleToggleActionRight(r.id, resource, action, hasRight)
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
                  <Shield className="text-muted-foreground/50 mx-auto h-12 w-12" />
                  <p className="text-muted-foreground mt-4">
                    No roles created yet. Click "Add Role" to create your first role.
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
