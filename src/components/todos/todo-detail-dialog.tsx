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
} from 'lucide-react';
import Link from 'next/link';
import { db, tx } from '../../../db/db';
import { toast } from 'sonner';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TodoDetailDialogProps {
  todo: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDetailDialog({ todo, open, onOpenChange }: TodoDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: todo.title || '',
    description: todo.description || '',
    status: todo.status || 'pending',
    priority: todo.priority || 'medium',
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
  });

  const isOverdue = todo.dueDate && todo.status !== 'completed' && todo.dueDate < Date.now();

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

      await db.transact([tx.todos[todo.id].update(updates)]);
      toast.success('Todo updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
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
    setIsEditing(false);
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
                  placeholder="Todo title"
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
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
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
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancelled
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
              <label className="mb-2 block text-sm font-medium">Priority</label>
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
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Urgent
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
            <label className="mb-2 block text-sm font-medium">Description</label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description..."
                rows={6}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {todo.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">Due Date</label>
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
                    Overdue
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No due date set</p>
            )}
          </div>

          {/* Creator */}
          {todo.creator && (
            <div>
              <label className="mb-2 block text-sm font-medium">Created By</label>
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
          {todo.assignments && todo.assignments.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Users className="mr-2 inline h-4 w-4" />
                Assigned To
              </label>
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
            </div>
          )}

          {/* Group */}
          {todo.group && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Building2 className="mr-2 inline h-4 w-4" />
                Group
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
                Tags
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
                Created: {todo.createdAt ? new Date(todo.createdAt).toLocaleString() : 'N/A'}
              </div>
              <div>
                Updated: {todo.updatedAt ? new Date(todo.updatedAt).toLocaleString() : 'N/A'}
              </div>
              {todo.completedAt && (
                <div className="col-span-2">
                  Completed: {new Date(todo.completedAt).toLocaleString()}
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
