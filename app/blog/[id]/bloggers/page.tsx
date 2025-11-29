'use client';

import { use, useState } from 'react';
import { db, tx, id } from '../../../../db';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/global-state/use-toast';

// Define available action rights for blogs
const ACTION_RIGHTS = [
  { resource: 'blogs', action: 'update', label: 'Update Blog' },
  { resource: 'blogs', action: 'delete', label: 'Delete Blog' },
  { resource: 'blogBloggers', action: 'manage', label: 'Manage Bloggers' },
];

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function BlogBloggersPage({ params }: PageParams) {
  const router = useRouter();
  const resolvedParams = use(params);
  const blogId = resolvedParams.id;
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('bloggers');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  // Query blog and bloggers
  const { data, isLoading, error } = db.useQuery({
    blogs: {
      $: {
        where: {
          id: blogId,
        },
      },
      blogRoleBloggers: {
        role: {
          actionRights: {},
        },
      },
      roles: {
        $: {
          where: {
            scope: 'blog',
          },
        },
        actionRights: {},
      },
    },
  });

  // Query all users for user search
  const { data: usersData, isLoading: isLoadingUsers } = db.useQuery({
    $users: {},
  });

  // Check if current user is owner
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  const blog = data?.blogs?.[0];
  const bloggers = blog?.blogRoleBloggers || [];
  const rolesData = { roles: blog?.roles || [] };

  const currentUserBlogger = bloggers.find((b: any) => b.user?.id === currentUserId);
  const isOwner = currentUserBlogger?.role?.name === 'Owner';

  // Get existing blogger IDs to exclude from invite search
  const existingBloggerIds = bloggers.map((b: any) => b.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.$users?.filter(user => {
    if (!user?.id) return false;
    if (existingBloggerIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
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
      const writerRole = rolesData.roles.find((r: any) => r.name === 'Writer');
      if (!writerRole) {
        throw new Error('Writer role not found');
      }

      const inviteTransactions = selectedUsers.map(userId => {
        const bloggerId = id();
        return tx.blogBloggers[bloggerId]
          .update({
            status: 'invited',
            createdAt: new Date(),
          })
          .link({ user: userId, blog: blogId, role: writerRole.id });
      });

      await db.transact(inviteTransactions);

      toast({
        title: 'Success',
        description: `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'blogger' : 'bloggers'}`,
      });

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite bloggers:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite bloggers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Handle role updates
  const handleUpdateRole = async (bloggerId: string, newRoleId: string) => {
    try {
      await db.transact(tx.blogBloggers[bloggerId].link({ role: newRoleId }));
      toast({
        title: 'Success',
        description: 'Blogger role updated successfully',
      });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update blogger role',
        variant: 'destructive',
      });
    }
  };

  // Handle removing blogger
  const handleRemoveBlogger = async (bloggerId: string) => {
    try {
      await db.transact(tx.blogBloggers[bloggerId].delete());
      toast({
        title: 'Success',
        description: 'Blogger removed successfully',
      });
    } catch (err) {
      console.error('Error removing blogger:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove blogger',
        variant: 'destructive',
      });
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
        const role = rolesData.roles.find((r: any) => r.id === roleId);
        const actionRightToRemove = role?.actionRights?.find(
          (ar: any) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await db.transact([tx.actionRights[actionRightToRemove.id].delete()]);
        }
      } else {
        // Add the action right
        const actionRightId = id();
        await db.transact([
          tx.actionRights[actionRightId]
            .update({
              resource,
              action,
            })
            .link({ roles: [roleId], blog: blogId }),
        ]);
      }
      toast({
        title: 'Success',
        description: 'Permission updated successfully',
      });
    } catch (error) {
      console.error('Failed to toggle action right:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  // Handle creating new role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const roleId = id();
      await db.transact([
        tx.roles[roleId].update({
          name: newRoleName,
          description: newRoleDescription,
          scope: 'blog',
        }),
        tx.roles[roleId].link({ blog: blogId }),
      ]);

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a role
  const handleDeleteRole = async (roleId: string) => {
    try {
      await db.transact(tx.roles[roleId].delete());
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter bloggers based on search and status
  const filteredBloggers = bloggers.filter((blogger: any) => {
    const matchesSearch =
      blogger.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blogger.user?.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blogger.user?.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Separate bloggers by status
  const activeBloggers = filteredBloggers.filter((b: any) => b.status === 'member');
  const invitedBloggers = filteredBloggers.filter((b: any) => b.status === 'invited');
  const requestedBloggers = filteredBloggers.filter((b: any) => b.status === 'requested');

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
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        <h1 className="text-3xl font-bold">Manage Bloggers</h1>
        <p className="mt-2 text-muted-foreground">
          Manage blogger access, roles, and permissions for {blog.title}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bloggers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {isOwner && (
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
                          filteredUsers?.map(user => (
                            <CommandItem
                              key={user.id}
                              className="flex cursor-pointer items-center space-x-2"
                              onSelect={() => toggleUserSelection(user.id)}
                            >
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => toggleUserSelection(user.id)}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || user.imageURL || ''} />
                                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{user.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
                                  @{user.handle || user.contactEmail || 'unknown'}
                                </div>
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  {selectedUsers.length > 0 && (
                    <div className="text-sm text-muted-foreground">
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bloggers">Bloggers ({filteredBloggers.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({rolesData.roles.length})</TabsTrigger>
        </TabsList>

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
                    {invitedBloggers.map((blogger: any) => {
                      const createdAt = blogger.createdAt
                        ? new Date(blogger.createdAt).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={blogger.user?.avatar || blogger.user?.imageURL || ''}
                                />
                                <AvatarFallback>
                                  {blogger.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{blogger.user?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
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
                            {isOwner && (
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
                <p className="py-8 text-center text-muted-foreground">
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
                    {activeBloggers.map((blogger: any) => {
                      const createdAt = blogger.createdAt
                        ? new Date(blogger.createdAt).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={blogger.user?.avatar || blogger.user?.imageURL || ''}
                                />
                                <AvatarFallback>
                                  {blogger.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{blogger.user?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
                                  @{blogger.user?.handle || 'unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isOwner && blogger.user?.id !== currentUserId ? (
                              <Select
                                value={blogger.role?.id}
                                onValueChange={newRoleId => handleUpdateRole(blogger.id, newRoleId)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rolesData.roles.map((role: any) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name}
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
                            {isOwner && blogger.user?.id !== currentUserId && (
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
                    {requestedBloggers.map((blogger: any) => {
                      const createdAt = blogger.createdAt
                        ? new Date(blogger.createdAt).toLocaleDateString()
                        : 'N/A';

                      return (
                        <TableRow key={blogger.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={blogger.user?.avatar || blogger.user?.imageURL || ''}
                                />
                                <AvatarFallback>
                                  {blogger.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{blogger.user?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
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
                            {isOwner && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    db.transact([
                                      tx.blogBloggers[blogger.id].update({
                                        status: 'member',
                                      }),
                                    ]);
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
                {isOwner && (
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
                        {rolesData.roles.map((role: any) => (
                          <TableHead key={role.id} className="min-w-[120px] text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">{role.name}</span>
                              {role.description && (
                                <span className="text-xs font-normal text-muted-foreground">
                                  {role.description}
                                </span>
                              )}
                              {isOwner && role.name !== 'Owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 w-6 p-0"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
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
                            {rolesData.roles.map((role: any) => {
                              const hasRight = role.actionRights?.some(
                                (ar: any) => ar.resource === resource && ar.action === action
                              );
                              return (
                                <TableCell key={role.id} className="text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={hasRight}
                                      disabled={!isOwner}
                                      onCheckedChange={() =>
                                        handleToggleActionRight(role.id, resource, action, hasRight)
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
