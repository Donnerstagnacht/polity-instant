'use client';

import { useParams } from 'next/navigation';
import { db, tx, id } from '../../../../db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Plus, Check, ChevronsUpDown, LayoutList, LayoutGrid } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { KanbanBoard } from '@/components/todos/kanban-board';
import { TodoList } from '@/components/todos/todo-list';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/auth.ts';

interface Link {
  id: string;
  label: string;
  url: string;
}

interface Payment {
  id: string;
  label: string;
  type: string;
  amount: number;
  receiverGroup?: { id: string };
  payerGroup?: { id: string };
  receiverUser?: { id: string };
  payerUser?: { id: string };
}

export default function GroupOperationPage() {
  const params = useParams();
  const groupId = params.id as string;
  const user = useAuthStore(state => state.user);

  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Query links for this group
  const { data: linksData } = db.useQuery({
    links: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
    },
  });

  // Query payments for this group
  const { data: paymentsData } = db.useQuery({
    payments: {
      $: {
        where: {
          or: [{ 'receiverGroup.id': groupId }, { 'payerGroup.id': groupId }],
        },
      },
      receiverGroup: {},
      payerGroup: {},
      receiverUser: {},
      payerUser: {},
    },
  });

  // Query todos for this group
  const { data: todosData } = db.useQuery({
    todos: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      creator: {},
      assignments: {
        user: {},
      },
      group: {},
    },
  });

  const links = (linksData?.links || []) as Link[];
  const payments = (paymentsData?.payments || []) as Payment[];
  const todos = todosData?.todos || [];

  // Calculate income and expenditure
  const { income, expenditure, incomeData, expenditureData } = useMemo(() => {
    const incomeByType: Record<string, number> = {};
    const expenditureByType: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenditure = 0;

    payments.forEach(payment => {
      const isIncome = payment.receiverGroup?.id === groupId;

      if (isIncome) {
        totalIncome += payment.amount;
        incomeByType[payment.type] = (incomeByType[payment.type] || 0) + payment.amount;
      } else {
        totalExpenditure += payment.amount;
        expenditureByType[payment.type] = (expenditureByType[payment.type] || 0) + payment.amount;
      }
    });

    const balance = totalIncome - totalExpenditure;

    // Prepare data for income chart
    const incomeChartData = Object.entries(incomeByType).map(([type, value]) => ({
      name: type.replace(/_/g, ' '),
      value,
    }));

    // Add available/balance to income chart if positive
    if (balance > 0) {
      incomeChartData.push({
        name: 'Available',
        value: balance,
      });
    }

    // Prepare data for expenditure chart
    const expenditureChartData = Object.entries(expenditureByType).map(([type, value]) => ({
      name: type.replace(/_/g, ' '),
      value,
    }));

    // Add deficit to expenditure chart if negative balance
    if (balance < 0) {
      expenditureChartData.push({
        name: 'Deficit',
        value: Math.abs(balance),
      });
    }

    return {
      income: totalIncome,
      expenditure: totalExpenditure,
      incomeData: incomeChartData,
      expenditureData: expenditureChartData,
    };
  }, [payments, groupId]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  const handleAddLink = async (formData: { label: string; url: string }) => {
    try {
      const linkId = id();
      await db.transact([
        tx.links[linkId]
          .update({
            label: formData.label,
            url: formData.url,
            createdAt: new Date(),
          })
          .link({ group: groupId }),
      ]);
      toast.success('Link added successfully!');
      setIsAddLinkOpen(false);
    } catch (error) {
      console.error('Failed to add link:', error);
      toast.error('Failed to add link');
    }
  };

  const handleAddPayment = async (formData: {
    label: string;
    type: string;
    amount: number;
    direction: 'income' | 'expense';
    payerUserId?: string;
    payerGroupId?: string;
    receiverUserId?: string;
    receiverGroupId?: string;
  }) => {
    try {
      const paymentId = id();

      // Create the base transaction
      let transaction = tx.payments[paymentId].update({
        label: formData.label,
        type: formData.type,
        amount: formData.amount,
        createdAt: new Date(),
      });

      // Build links object based on provided IDs
      const links: any = {};

      if (formData.payerUserId) {
        links.payerUser = formData.payerUserId;
      }
      if (formData.payerGroupId) {
        links.payerGroup = formData.payerGroupId;
      }
      if (formData.receiverUserId) {
        links.receiverUser = formData.receiverUserId;
      }
      if (formData.receiverGroupId) {
        links.receiverGroup = formData.receiverGroupId;
      }

      console.log('Creating payment with links:', links);

      // Apply links
      if (Object.keys(links).length > 0) {
        transaction = transaction.link(links);
      } else {
        console.error('No links provided for payment!');
        toast.error('Payment must have a payer and receiver');
        return;
      }

      await db.transact([transaction]);
      console.log('Payment created successfully');
      toast.success('Payment added successfully!');
      setIsAddPaymentOpen(false);
      setIsAddExpenseOpen(false);
    } catch (error) {
      console.error('Failed to add payment:', error);
      toast.error('Failed to add payment');
    }
  };

  const handleAddTodo = async (formData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in');
        return;
      }

      const todoId = id();
      const assignmentId = id();
      const now = Date.now();

      await db.transact([
        tx.todos[todoId].update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority as any,
          status: 'todo',
          dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.todos[todoId].link({ creator: user.id, group: groupId }),
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: user.id }),
      ]);

      toast.success('Todo added successfully!');
      setIsAddTodoOpen(false);
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast.error('Failed to add todo');
    }
  };

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

  const handleUpdateStatus = async (todoId: string, newStatus: string) => {
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

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Links Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Links</CardTitle>
            <AddLinkDialog
              open={isAddLinkOpen}
              onOpenChange={setIsAddLinkOpen}
              onSubmit={handleAddLink}
            />
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-muted-foreground">No links available</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income: ${income.toLocaleString()}</CardTitle>
              <AddPaymentDialog
                open={isAddPaymentOpen}
                onOpenChange={setIsAddPaymentOpen}
                onSubmit={handleAddPayment}
                direction="income"
                groupId={groupId}
              />
            </div>
          </CardHeader>
          <CardContent>
            {incomeData.length === 0 ? (
              <p className="text-muted-foreground">No income data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300} key={`income-${payments.length}`}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: $${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expenditure Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expenditure: ${expenditure.toLocaleString()}</CardTitle>
              <AddPaymentDialog
                open={isAddExpenseOpen}
                onOpenChange={setIsAddExpenseOpen}
                onSubmit={handleAddPayment}
                direction="expense"
                groupId={groupId}
              />
            </div>
          </CardHeader>
          <CardContent>
            {expenditureData.length === 0 ? (
              <p className="text-muted-foreground">No expenditure data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300} key={`expenditure-${payments.length}`}>
                <PieChart>
                  <Pie
                    data={expenditureData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: $${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenditureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Todos Kanban Board */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex gap-2">
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <AddTodoDialog
                open={isAddTodoOpen}
                onOpenChange={setIsAddTodoOpen}
                onSubmit={handleAddTodo}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <p className="text-muted-foreground">No tasks for this group</p>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard todos={todos as any} />
          ) : (
            <TodoList
              todos={todos}
              onToggleComplete={handleToggleComplete}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Dialog Components
function AddLinkDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { label: string; url: string }) => void;
}) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ label, url });
    setLabel('');
    setUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
            <DialogDescription>Add a link to this group's resources.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-label">Label</Label>
              <Input
                id="link-label"
                placeholder="Website, Social Media, etc."
                value={label}
                onChange={e => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  direction,
  groupId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    type: string;
    amount: number;
    direction: 'income' | 'expense';
    payerUserId?: string;
    payerGroupId?: string;
    receiverUserId?: string;
    receiverGroupId?: string;
  }) => void;
  direction: 'income' | 'expense';
  groupId: string;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('donation');
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [entityType, setEntityType] = useState<'user' | 'group'>('user');
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    name: string;
    type: 'user' | 'group';
  } | null>(null);

  // Query users (profiles) and groups
  const { data: profilesData } = db.useQuery({
    profiles: {
      $: {
        where: {
          isActive: true,
        },
      },
      user: {},
    },
  });

  const { data: groupsData } = db.useQuery({
    groups: {},
  });

  // Filter entities based on search query and selected entity type
  const filteredUsers =
    entityType === 'user'
      ? profilesData?.profiles?.filter(profile => {
          if (!profile.user?.id) return false;
          const query = searchQuery.toLowerCase();
          return (
            profile.name?.toLowerCase().includes(query) ||
            profile.handle?.toLowerCase().includes(query) ||
            profile.contactEmail?.toLowerCase().includes(query)
          );
        })
      : [];

  const filteredGroups =
    entityType === 'group'
      ? groupsData?.groups?.filter(group => {
          const query = searchQuery.toLowerCase();
          return group.name?.toLowerCase().includes(query);
        })
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that an entity is selected
    if (!selectedEntity) {
      toast.error(`Please select a ${direction === 'income' ? 'payer' : 'receiver'}`);
      return;
    }

    const paymentData: any = {
      label,
      type,
      amount: parseFloat(amount),
      direction,
    };

    // Set payer and receiver based on direction
    if (direction === 'income') {
      // Group is receiver, selected entity is payer
      paymentData.receiverGroupId = groupId;
      if (selectedEntity.type === 'user') {
        paymentData.payerUserId = selectedEntity.id;
      } else {
        paymentData.payerGroupId = selectedEntity.id;
      }
    } else {
      // Group is payer, selected entity is receiver
      paymentData.payerGroupId = groupId;
      if (selectedEntity.type === 'user') {
        paymentData.receiverUserId = selectedEntity.id;
      } else {
        paymentData.receiverGroupId = selectedEntity.id;
      }
    }

    onSubmit(paymentData);
    setLabel('');
    setType('donation');
    setAmount('');
    setSelectedEntity(null);
    setSearchQuery('');
    setEntityType('user');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add {direction === 'income' ? 'Income' : 'Expense'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {direction === 'income' ? 'Income' : 'Expense'}</DialogTitle>
            <DialogDescription>
              Record a new {direction} transaction for this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-label">Label</Label>
              <Input
                id="payment-label"
                placeholder="Description of payment"
                value={label}
                onChange={e => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membership_fee">Membership Fee</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="subsidies">Subsidies</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-entity">
                {direction === 'income' ? 'From (Payer)' : 'To (Receiver)'}
              </Label>

              {/* Toggle between User and Group */}
              <div className="mb-2 flex gap-2">
                <Button
                  type="button"
                  variant={entityType === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntityType('user');
                    setSelectedEntity(null);
                    setSearchQuery('');
                  }}
                  className="flex-1"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={entityType === 'group' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntityType('group');
                    setSelectedEntity(null);
                    setSearchQuery('');
                  }}
                  className="flex-1"
                >
                  Group
                </Button>
              </div>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="payment-entity"
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedEntity ? (
                      <div className="flex items-center gap-2">
                        {selectedEntity.type === 'user' && (
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {selectedEntity.name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span>{selectedEntity.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({selectedEntity.type})
                        </span>
                      </div>
                    ) : (
                      `Select ${entityType}...`
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={`Search ${entityType === 'user' ? 'users' : 'groups'}...`}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        No {entityType === 'user' ? 'users' : 'groups'} found.
                      </CommandEmpty>
                      {filteredUsers && filteredUsers.length > 0 && (
                        <CommandGroup heading="Users">
                          {filteredUsers.map(profile => {
                            if (!profile.user?.id) return null;
                            const userId = profile.user.id;
                            const isSelected = selectedEntity?.id === userId;
                            return (
                              <CommandItem
                                key={userId}
                                value={`user-${userId}`}
                                onSelect={() => {
                                  setSelectedEntity({
                                    id: userId,
                                    name: profile.name || 'Unnamed User',
                                    type: 'user',
                                  });
                                  setPopoverOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    {profile.avatar ? (
                                      <AvatarImage src={profile.avatar} alt={profile.name || ''} />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                      {profile.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {profile.name || 'Unnamed User'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {profile.handle ? `@${profile.handle}` : profile.contactEmail}
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
                      )}
                      {filteredGroups && filteredGroups.length > 0 && (
                        <CommandGroup heading="Groups">
                          {filteredGroups.map(group => {
                            const isSelected = selectedEntity?.id === group.id;
                            return (
                              <CommandItem
                                key={group.id}
                                value={`group-${group.id}`}
                                onSelect={() => {
                                  setSelectedEntity({
                                    id: group.id,
                                    name: group.name,
                                    type: 'group',
                                  });
                                  setPopoverOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {group.name[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{group.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {group.memberCount} members
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
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTodoDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, priority, dueDate });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="todo-title">Title</Label>
              <Input
                id="todo-title"
                placeholder="Task title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-description">Description</Label>
              <Textarea
                id="todo-description"
                placeholder="Task description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="todo-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-dueDate">Due Date (Optional)</Label>
              <Input
                id="todo-dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
