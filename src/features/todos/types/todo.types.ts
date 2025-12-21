export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TodoFormData {
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: number | string;
  createdAt?: number;
  updatedAt?: number;
  completedAt?: number;
  tags?: string[];
  creator?: {
    id: string;
    email?: string;
    avatar?: string;
  };
  assignments?: Array<{
    user?: {
      id: string;
      email?: string;
      avatar?: string;
    };
  }>;
  group?: {
    id: string;
    name?: string;
    imageURL?: string;
  };
}
