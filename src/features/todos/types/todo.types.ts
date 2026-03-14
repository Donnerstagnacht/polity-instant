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
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: number | null;
  completed_at: number | null;
  tags: string[] | null;
  visibility: string;
  creator_id: string;
  group_id: string | null;
  event_id: string | null;
  amendment_id: string | null;
  created_at: number;
  updated_at: number;
  creator?: {
    id: string;
    email: string | null;
    handle: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  };
  assignments?: Array<{
    id: string;
    todo_id: string;
    user_id: string;
    role: string | null;
    assigned_at: number;
    user?: {
      id: string;
      email: string | null;
      handle: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar: string | null;
    };
  }>;
  group?: {
    id: string;
    name: string | null;
    image_url: string | null;
  };
}
