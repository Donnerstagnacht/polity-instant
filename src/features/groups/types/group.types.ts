/**
 * Group Feature Types
 *
 * TypeScript type definitions for the group feature.
 */

export interface GroupMembershipWithUser {
  id: string;
  user_id?: string;
  group_id?: string;
  role_id?: string | null;
  status?: string | null;
  source?: string;
  created_at?: number | string;
  visibility?: string;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar?: string | null;
    handle?: string | null;
    [key: string]: any;
  };
  role?: {
    id: string;
    name: string | null;
    [key: string]: any;
  };
}

export interface GroupRole {
  id: string;
  name: string | null;
  description?: string | null;
  group_id?: string | null;
  scope?: string | null;
  sort_order?: number;
  created_at?: number | string;
  updated_at?: number | string;
  action_rights?: readonly GroupActionRight[];
}

export interface GroupActionRight {
  id: string;
  role_id?: string;
  resource: string | null;
  action: string | null;
  group_id?: string | null;
  event_id?: string | null;
  amendment_id?: string | null;
  blog_id?: string | null;
  created_at?: number;
}

export interface ActionRightOption {
  resource: string;
  action: string;
  label: string;
}

export interface GroupLink {
  id: string;
  groupId?: string;
  label: string | null;
  url: string | null;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface GroupPayment {
  id: string;
  groupId?: string;
  amount: number | null;
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

export type MembershipTab = 'memberships' | 'roles' | 'positions';
export type TodoViewMode = 'kanban' | 'list';
