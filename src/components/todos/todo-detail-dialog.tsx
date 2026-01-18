'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Calendar,
  Tag,
  Users,
  Building2,
  Edit,
  Save,
  X,
  AlertCircle,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  UserPlus,
  Trash2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { db, tx } from '../../../db/db';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TodoDetailDialogProps {
  todo: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDetailDialog({ todo, open, onOpenChange }: TodoDetailDialogProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    todo.assignments?.map((a: any) => a.user?.id).filter(Boolean) || []
  );
  const [formData, setFormData] = useState({
    title: todo.title || '',
    description: todo.description || '',
    status: todo.status || 'pending',
    priority: todo.priority || 'medium',
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
  });

  const isOverdue = todo.dueDate && todo.status !== 'completed' && todo.dueDate < Date.now();

  // Query group members if the todo belongs to a group
  const { data: membersData } = db.useQuery(
    todo.group?.id
      ? {
          groupMemberships: {
            $: {
              where: {
                'group.id': todo.group.id,
                status: 'member',
              },
            },
            user: {},
          },
        }
      : null
  );

  const members = membersData?.groupMemberships || [];

  // Filter members based on search query
  const filteredMembers = members.filter((membership: any) => {
    const user = membership.user;
    if (!user?.id) return false;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
        updatedAt: Date.now(),
      };

      if (formData.status === 'completed' && todo.status !== 'completed') {
        updates.completedAt = Date.now();
      } else if (formData.status !== 'completed' && todo.status === 'completed') {
        updates.completedAt = null;
      }

      const transactions: any[] = [tx.todos[todo.id].update(updates)];

      // Handle assignment changes
      const currentAssignmentIds = todo.assignments?.map((a: any) => a.user?.id).filter(Boolean) || [];
      const addedUserIds = selectedUserIds.filter(id => !currentAssignmentIds.includes(id));
      const removedAssignments = todo.assignments?.filter(
        (a: any) => a.user?.id && !selectedUserIds.includes(a.user.id)
      ) || [];

      // Remove old assignments
      removedAssignments.forEach((assignment: any) => {
        transactions.push(tx.todoAssignments[assignment.id].delete());
      });

      // Add new assignments
      addedUserIds.forEach((userId: string) => {
        const assignmentId = crypto.randomUUID();
        transactions.push(
          tx.todoAssignments[assignmentId]
            .update({
              createdAt: Date.now(),
            })
            .link({
              todo: todo.id,
              user: userId,
            })
        );
      });

      await db.transact(transactions);
      toast.success(t('features.todos.notifications.todoUpdated'));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error(t('features.todos.notifications.todoUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: todo.title || '',
      description: todo.description || '',
      status: todo.status || 'pending',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
    });
    setSelectedUserIds(
      todo.assignments?.map((a: any) => a.user?.id).filter(Boolean) || []
    );
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleRemoveAssignee = (userId: string) => {
    setSelectedUserIds(prev => prev.filter(id => id !== userId));
  };

  const handleAddAssignee = (userId: string) => {
    if (!selectedUserIds.includes(userId)) {
      setSelectedUserIds(prev => [...prev, userId]);
    }
    setPopoverOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="text-2xl font-bold"
                  placeholder={t('features.todos.detail.todoTitle')}
                />
              ) : (
                <span className="text-2xl">{todo.title}</span>
              )}
            </DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    {t('features.todos.detail.save')}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    {t('features.todos.detail.cancel')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  {t('features.todos.actions.edit')}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">{t('features.todos.detail.status')}</label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(v: TodoStatus) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4" />
                        {t('features.todos.status.pending')}
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('features.todos.status.inProgress')}
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('features.todos.status.completed')}
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        {t('features.todos.status.cancelled')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusIcon status={todo.status} />
                  <span className="capitalize">{todo.status.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t('features.todos.detail.priority')}</label>
              {isEditing ? (
                <Select
                  value={formData.priority}
                  onValueChange={(v: TodoPriority) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-blue-500" />
                        {t('features.todos.priority.low')}
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-yellow-500" />
                        {t('features.todos.priority.medium')}
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-orange-500" />
                        {t('features.todos.priority.high')}
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        {t('features.todos.priority.urgent')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <PriorityIcon priority={todo.priority} />
                  <PriorityBadge priority={todo.priority} />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t('features.todos.detail.description')}</label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('features.todos.detail.addDescription')}
                rows={6}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {todo.description || t('features.todos.detail.noDescription')}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t('features.todos.dueDate.title')}</label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            ) : todo.dueDate ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={isOverdue ? 'font-medium text-destructive' : ''}>
                  {formatDate(todo.dueDate)}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {t('features.todos.status.overdue')}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('features.todos.detail.noDueDateSet')}</p>
            )}
          </div>

          {/* Creator */}
          {todo.creator && (
            <div>
              <label className="mb-2 block text-sm font-medium">{t('features.todos.detail.createdBy')}</label>
              <Link
                href={`/user/${todo.creator.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={todo.creator.avatar} />
                  <AvatarFallback>{todo.creator.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <span>{todo.creator.email?.split('@')[0] || 'Unknown'}</span>
              </Link>
            </div>
          )}

          {/* Assigned Users */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Users className="mr-2 inline h-4 w-4" />
              {t('features.todos.detail.assignedTo')}
            </label>
            {isEditing ? (
              <div className="space-y-3">
                {/* Show currently selected users */}
                {selectedUserIds.length > 0 && (
                  <div className="space-y-2">
                    {selectedUserIds.map((userId: string) => {
                      const membership = members.find((m: any) => m.user?.id === userId);
                      const user = membership?.user || todo.assignments?.find((a: any) => a.user?.id === userId)?.user;
                      if (!user) return null;
                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.imageURL || user.avatar} />
                              <AvatarFallback>
                                {user.fullName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {user.fullName || user.email?.split('@')[0] || 'Unknown'}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignee(userId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Add user button */}
                {todo.group?.id && (
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!members.length}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('features.todos.assignee.addAssignee')}
                        <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={t('features.todos.assignee.searchMembers')}
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>{t('features.todos.assignee.noMembersFound')}</CommandEmpty>
                          <CommandGroup>
                            {filteredMembers
                              .filter((m: any) => !selectedUserIds.includes(m.user?.id))
                              .map((membership: any) => {
                                const user = membership.user;
                                return (
                                  <CommandItem
                                    key={user.id}
                                    value={user.id}
                                    onSelect={() => handleAddAssignee(user.id)}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        selectedUserIds.includes(user.id) ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <Avatar className="mr-2 h-6 w-6">
                                      <AvatarImage src={user.imageURL} />
                                      <AvatarFallback>
                                        {user.fullName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">
                                        {user.fullName || user.handle || 'Unknown'}
                                      </span>
                                      {user.email && (
                                        <span className="text-xs text-muted-foreground">
                                          {user.email}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                );
                              })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ) : todo.assignments && todo.assignments.length > 0 ? (
              <div className="space-y-2">
                {todo.assignments.map((assignment: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/user/${assignment.user?.id}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignment.user?.avatar} />
                      <AvatarFallback>
                        {assignment.user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{assignment.user?.email?.split('@')[0] || 'Unknown'}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('features.todos.assignee.noUsersAssigned')}</p>
            )}
          </div>

          {/* Group */}
          {todo.group && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Building2 className="mr-2 inline h-4 w-4" />
                {t('features.todos.group.title')}
              </label>
              <Link
                href={`/group/${todo.group.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={todo.group.avatar} />
                  <AvatarFallback>{todo.group.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
                </Avatar>
                <span>{todo.group.name}</span>
              </Link>
            </div>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Tag className="mr-2 inline h-4 w-4" />
                {t('features.todos.detail.tags')}
              </label>
              <div className="flex flex-wrap gap-2">
                {todo.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>
                {t('features.todos.detail.created')}: {todo.createdAt ? new Date(todo.createdAt).toLocaleString() : 'N/A'}
              </div>
              <div>
                {t('features.todos.detail.updated')}: {todo.updatedAt ? new Date(todo.updatedAt).toLocaleString() : 'N/A'}
              </div>
              {todo.completedAt && (
                <div className="col-span-2">
                  {t('features.todos.status.completed')}: {new Date(todo.completedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusIcon({ status }: { status: TodoStatus }) {
  switch (status) {
    case 'pending':
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function PriorityIcon({ priority }: { priority: TodoPriority }) {
  switch (priority) {
    case 'urgent':
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    case 'high':
      return <Flag className="h-3.5 w-3.5 text-orange-500" />;
    case 'medium':
      return <Flag className="h-3.5 w-3.5 text-yellow-500" />;
    case 'low':
      return <Flag className="h-3.5 w-3.5 text-blue-500" />;
  }
}

function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const colors = {
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Badge variant="outline" className={`${colors[priority]} capitalize`}>
      {priority}
    </Badge>
  );
}

function formatDate(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp : parseInt(timestamp));
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
