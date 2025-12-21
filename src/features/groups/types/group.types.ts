/**
 * Group Feature Types
 *
 * TypeScript type definitions for the group feature.
 */

export interface GroupMembershipWithUser {
  id: string;
  userId?: string;
  groupId?: string;
  roleId?: string;
  status?: string;
  createdAt?: number | string;
  visibility?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    username?: string;
    imageURL?: string;
    [key: string]: any;
  };
  role?: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

export interface GroupRole {
  id: string;
  name: any;
  description?: string;
  groupId?: string;
  scope?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  actionRights?: GroupActionRight[];
}

export interface GroupActionRight {
  id: string;
  roleId?: string;
  resource: string;
  action: string;
  createdAt?: number | string;
  [key: string]: any;
}

export interface ActionRightOption {
  resource: string;
  action: string;
  label: string;
}

export interface GroupLink {
  id: string;
  groupId?: string;
  label: string;
  url: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface GroupPayment {
  id: string;
  groupId?: string;
  amount: number;
  currency?: string;
  description?: string;
  type?: 'income' | 'expense' | string;
  date?: number;
  payerId?: string;
  receiverId?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'user' | 'group' | 'event' | 'amendment';
  createdAt?: number;
  updatedAt?: number;
  payer?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  receiver?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  payerGroup?: {
    id: string;
    name?: string;
  };
  receiverGroup?: {
    id: string;
    name?: string;
  };
  payerUser?: {
    id: string;
    name?: string;
  };
  receiverUser?: {
    id: string;
    name?: string;
  };
  [key: string]: any;
}

export interface GroupTodo {
  id: string;
  groupId?: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done' | string;
  priority?: 'low' | 'medium' | 'high' | string;
  assignedToId?: string;
  dueDate?: number | string;
  createdAt?: number;
  updatedAt?: number;
  assignedTo?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  [key: string]: any;
}

export interface GroupDocument {
  id: string;
  groupId: string;
  title: string;
  content?: any;
  discussions?: any;
  createdById: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export interface FinancialSummary {
  income: number;
  expenditure: number;
  balance: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export type MembershipTab = 'memberships' | 'roles';
export type TodoViewMode = 'kanban' | 'list';
