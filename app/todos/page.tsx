'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { db, tx } from '@/../../db.ts';
import { useAuthStore } from '@/features/auth/auth.ts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Flag,
  Plus,
  Search,
  Calendar,
  Tag,
  User,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { toast } from 'sonner';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
type SortBy = 'dueDate' | 'priority' | 'createdAt' | 'title';

export default function TodosPage() {
  const user = useAuthStore(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | TodoStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [filterPriority, setFilterPriority] = useState<'all' | TodoPriority>('all');

  // Query todos with assignments and creator
  const { data, isLoading } = db.useQuery({
    todos: {
      creator: {},
      assignments: {
        user: {},
      },
    },
  });

  // Filter and sort todos
  const filteredTodos = useMemo(() => {
    if (!data?.todos) return [];

    let todos = data.todos;

    // Filter by user's todos (created by or assigned to)
    todos = todos.filter(
      todo =>
        todo.creator?.id === user?.id || todo.assignments?.some((a: any) => a.user?.id === user?.id)
    );

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      todos = todos.filter(
        (todo: any) =>
          todo.title?.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query) ||
          todo.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by status tab
    if (selectedTab !== 'all') {
      todos = todos.filter((todo: any) => todo.status === selectedTab);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      todos = todos.filter((todo: any) => todo.priority === filterPriority);
    }

    // Sort todos
    todos = [...todos].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate - b.dueDate;
        case 'priority': {
          const priorityOrder: Record<TodoPriority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return (
            priorityOrder[b.priority as TodoPriority] - priorityOrder[a.priority as TodoPriority]
          );
        }
        case 'createdAt':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return todos;
  }, [data?.todos, user?.id, searchQuery, selectedTab, sortBy, filterPriority]);

  // Count todos by status
  const statusCounts = useMemo(() => {
    if (!data?.todos) return { all: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 };

    const userTodos = data.todos.filter(
      (todo: any) =>
        todo.creator?.id === user?.id || todo.assignments?.some((a: any) => a.user?.id === user?.id)
    );

    return {
      all: userTodos.length,
      pending: userTodos.filter((t: any) => t.status === 'pending').length,
      in_progress: userTodos.filter((t: any) => t.status === 'in_progress').length,
      completed: userTodos.filter((t: any) => t.status === 'completed').length,
      cancelled: userTodos.filter((t: any) => t.status === 'cancelled').length,
    };
  }, [data?.todos, user?.id]);

  const handleToggleComplete = async (todo: any) => {
    try {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      const updates: any = {
        status: newStatus,
        updatedAt: Date.now(),
      };

      if (newStatus === 'completed') {
        updates.completedAt = Date.now();
      } else {
        updates.completedAt = null;
      }

      await db.transact([tx.todos[todo.id].update(updates)]);
      toast.success(newStatus === 'completed' ? 'Todo completed!' : 'Todo reopened!');
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleUpdateStatus = async (todoId: string, newStatus: TodoStatus) => {
    try {
      const updates: any = {
        status: newStatus,
        updatedAt: Date.now(),
      };

      if (newStatus === 'completed') {
        updates.completedAt = Date.now();
      } else {
        updates.completedAt = null;
      }

      await db.transact([tx.todos[todoId].update(updates)]);
      toast.success('Status updated!');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  if (!user) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen max-w-7xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">My Todos</h1>
            <p className="text-muted-foreground">Manage your tasks and track your progress</p>
          </div>
          <Link href="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Todo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search todos..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterPriority} onValueChange={(v: any) => setFilterPriority(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
          <TabsList className="mb-6 grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Progress ({statusCounts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({statusCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Cancelled ({statusCounts.cancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading todos...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No todos found</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No todos match your search'
                      : selectedTab === 'all'
                        ? "You haven't created any todos yet"
                        : `You have no ${selectedTab.replace('_', ' ')} todos`}
                  </p>
                  <Link href="/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Todo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-3">
                  {filteredTodos.map((todo: any) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={handleToggleComplete}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </AuthGuard>
  );
}

function TodoCard({
  todo,
  onToggleComplete,
  onUpdateStatus,
}: {
  todo: any;
  onToggleComplete: (todo: any) => void;
  onUpdateStatus: (todoId: string, status: TodoStatus) => void;
}) {
  const isCompleted = todo.status === 'completed';
  const isOverdue = todo.dueDate && todo.status !== 'completed' && todo.dueDate < Date.now();

  return (
    <Card className={`transition-opacity ${isCompleted ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(todo)}
            className="mt-1 flex-shrink-0"
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
            )}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className={`mb-1 font-semibold ${isCompleted ? 'text-muted-foreground line-through' : ''}`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {todo.description}
                  </p>
                )}

                {/* Meta information */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    <PriorityIcon priority={todo.priority} />
                    <span className="capitalize">{todo.priority}</span>
                  </div>

                  {/* Due date */}
                  {todo.dueDate && (
                    <div
                      className={`flex items-center gap-1 ${isOverdue ? 'font-medium text-destructive' : ''}`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(todo.dueDate)}</span>
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                  )}

                  {/* Creator */}
                  {todo.creator && (
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{todo.creator.email?.split('@')[0] || 'Unknown'}</span>
                    </div>
                  )}

                  {/* Assignees count */}
                  {todo.assignments && todo.assignments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {todo.assignments.slice(0, 3).map((assignment: any, idx: number) => (
                          <Avatar key={idx} className="h-5 w-5 border-2 border-background">
                            <AvatarImage src={assignment.user?.avatar} />
                            <AvatarFallback className="text-xs">
                              {assignment.user?.email?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {todo.assignments.length > 3 && (
                        <span className="text-xs">+{todo.assignments.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {todo.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status badge and actions */}
              <div className="flex flex-col items-end gap-2">
                <Select
                  value={todo.status}
                  onValueChange={(v: TodoStatus) => onUpdateStatus(todo.id, v)}
                >
                  <SelectTrigger className="w-[140px]">
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

                <PriorityBadge priority={todo.priority} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
    urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  };

  return (
    <Badge variant="secondary" className={`${colors[priority]} border-0 text-xs capitalize`}>
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

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
